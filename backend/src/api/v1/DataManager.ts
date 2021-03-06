import { config } from '../../config'
import { HTTPStatus, IErrorable } from '../../lms/errors'
import {
    IDataFieldData,
    IFieldData,
    IForeignFieldData,
} from '../../lms/FieldData'
import { fixStepper, IStepper } from '../../lms/Stepper'
import { ICreateUpdate } from '../../lms/types'
import {
    concatOrSetMapArray,
    convertToKey,
    PTR,
    splitId,
    str,
} from '../../lms/util'
import { AuthUser } from '../auth'

/**
 * General wrapper for a data type that can be managed by the system. Handles
 * input parsing and output conversion. Each instance manages a single data
 * type.
 *
 * @typeParam Type The type of data managed by this.
 */
export class DataManager<Type> extends IErrorable {
    /** True if this type has a createdAt field that should be managed */
    protected hasCreate: boolean
    /** True if this type has an updatedAt field that should be managed */
    protected hasUpdate: boolean

    /** Pair array of the field entries */
    protected fieldEntries: [string, IFieldData][]
    /** Pair array of foreign entries */
    protected foreignEntries: [string, IForeignFieldData][]
    /** Pair array of data entries */
    private dataEntries: [string, IDataFieldData][]
    /** Parent field data */
    protected parentField: null | {
        local: string
        foreign: string
    }

    /**
     * Accepts a non id/key string and converts it into a valid document
     */
    protected buildFromString?: (
        user: AuthUser,
        files: any,
        str: string,
        par: string
    ) => Promise<Type>

    /**
     * Modifies a doc, if required. Called before verifying any fields.
     */
    protected modifyDoc?: (
        user: AuthUser,
        files: any,
        doc: any
    ) => Promise<Type>

    /**
     * Runs the passed function on each foreign key in the document.
     *
     * @param doc The document to iterate through
     * @param fn The function to call on each key
     * @param skippable A function that returns `true` if a key should be
     * skipped.
     */
    public async updateForeignKeys(
        doc: Type,
        fn: (value: any, data: IForeignFieldData) => Promise<any>,
        skippable?: (data: IForeignFieldData) => boolean
    ): Promise<Type> {
        return this.forEachForeignKey(
            doc,
            // Foreign key
            async (p, o, d) => (p.obj[p.key] = await fn(o, d)),
            // Foreign key array
            async (p, a, d) =>
                (p.obj[p.key] = await Promise.all(a.map((o) => fn(o, d)))),
            // Foreign key stepper
            async (p, s, d) => {
                let temp: any = {}
                for (let stepId in s) {
                    let stepArray = s[stepId]

                    if (!Array.isArray(stepArray)) {
                        throw this.error(
                            'mapForeignKeys',
                            HTTPStatus.BAD_REQUEST,
                            'Unexpected type',
                            `${stepArray} is not an array`
                        )
                    }
                    temp[stepId] = await Promise.all(
                        stepArray.map((o) => fn(o, d))
                    )
                }
                p.obj[p.key] = temp
            },
            skippable
        )
    }

    /**
     * Maps each field in the object through a callback function and sets its
     * value to the return type. Modifies all values in-place.
     *
     * @param allFn Runs for all keys. Returns true if this key should be
     * skipped
     * @param foreignFn Runs for each foreign key
     * @param dataFn Runs for each data key
     * @param otherFn Runs for each other key
     * @param parentFn Runs for parent keys
     */
    protected async updateEachField(
        doc: any,
        allFn?: (pointer: PTR<any>, data: IFieldData) => Promise<boolean>,
        foreignFn?: (value: any, data: IForeignFieldData) => Promise<any>,
        dataFn?: (value: any, data: IDataFieldData) => Promise<any>,
        otherFn?: (value: any, data: IFieldData) => Promise<any>,
        parentFn?: (value: any, data: IFieldData) => Promise<any>
    ): Promise<any> {
        // Loop over every field
        for (let [key, data] of this.fieldEntries) {
            // Dummy values aren't real
            if (data.dummy) continue
            //  Run allFn callback
            if (allFn && (await allFn({ obj: doc, key }, data))) {
                continue
            }

            // Cache value
            let value = doc[key]

            // Switch on data type
            switch (data.type) {
                case 'number':
                    if (typeof doc[key] === 'string')
                        doc[key] = parseInt(doc[key])
                case 'string':
                case 'boolean':
                    if (otherFn) doc[key] = await otherFn(doc[key], data)
                    break
                case 'parent':
                    if (parentFn) doc[key] = await parentFn(value, data)
                    break
                case 'data':
                    if (dataFn)
                        doc[key] = await dataFn(value, data as IDataFieldData)
                    break
                case 'fkey':
                    if (foreignFn)
                        doc[key] = await foreignFn(
                            value,
                            data as IForeignFieldData
                        )
                    break
                case 'array':
                    value = Array.isArray(value) ? value : [value]

                    if (value.length === 0) {
                        break
                    }

                    // Run manager maps
                    if (data.foreignManager) {
                        if (foreignFn) {
                            let d = data as IForeignFieldData
                            doc[key] = await Promise.all(
                                value.map(async (o: any) => foreignFn(o, d))
                            )
                        }
                    } else if (data.dataManager) {
                        if (dataFn) {
                            let d = data as IDataFieldData
                            doc[key] = await Promise.all(
                                value.map(async (o: any) => dataFn(o, d))
                            )
                        }
                    } else {
                        console.log(data.foreignManager)
                        throw this.internal(
                            'mapEachField',
                            `${str(data)} has array type but neither reference.`
                        )
                    }
                    break
                case 'step':
                    let dF = data as IForeignFieldData
                    let dD = data as IDataFieldData

                    // Deconstruct stepper
                    let stepper: any = {}
                    for (let stepId in value) {
                        let stepArray = value[stepId]

                        if (!Array.isArray(stepArray)) {
                            throw this.error(
                                'mapForeignKeys',
                                HTTPStatus.BAD_REQUEST,
                                'Unexpected type',
                                `${JSON.stringify(stepArray)} is not an array`
                            )
                        }

                        if (data.foreignManager) {
                            if (!foreignFn) {
                                break
                            }
                            stepper[stepId] = await Promise.all(
                                stepArray.map((o: any) => foreignFn(o, dF))
                            )
                        } else if (data.dataManager) {
                            if (!dataFn) {
                                break
                            }
                            stepper[stepId] = await Promise.all(
                                stepArray.map((o: any) => dataFn(o, dD))
                            )
                        } else {
                            throw this.internal(
                                'mapEachField',
                                `${data} has step type but neither reference.`
                            )
                        }
                    }
                    doc[key] = stepper
            }
        }

        // Return the modified document
        return doc
    }

    /**
     * Runs the callbacks on each foreign key in the document.
     *
     * @param doc The document to loop through
     * @param keyCall Runs for each foreign key
     * @param arrCall Runs for each foreign array
     * @param stpCall Runs for each foreign step object
     * @param skippable Returns `true` if this key can be skipped
     */
    protected async forEachForeignKey(
        doc: Type,
        keyCall: (
            pointer: PTR<any>,
            obj: any,
            data: IForeignFieldData
        ) => Promise<any>,
        arrCall: (
            pointer: PTR<any>,
            arr: Array<any>,
            data: IForeignFieldData
        ) => Promise<any>,
        stpCall: (
            pointer: PTR<any>,
            stp: IStepper<any>,
            data: IForeignFieldData
        ) => Promise<any>,
        skippable?: (data: IForeignFieldData) => boolean
    ): Promise<Type> {
        for (let [fkey, data] of this.foreignEntries) {
            if (data.dummy) continue
            if (skippable && skippable(data)) continue

            if (!(fkey in doc)) {
                if (data.optional) {
                    console.warn(`Optional foreign key [${fkey}] dne`)
                    continue
                }
                throw this.error(
                    'forEachForeignKey',
                    HTTPStatus.BAD_REQUEST,
                    'Missing field',
                    `Foreign field [${fkey}] dne in [${JSON.stringify(doc)}]`
                )
            }

            // key of doc pointing to a foreign object
            let local = fkey as keyof Type
            // An array, string, or step object representing the foreign keys
            let foreign = doc[local]

            switch (data.type) {
                // Single foreign key
                case 'data':
                case 'fkey':
                    await keyCall({ obj: doc, key: local }, foreign, data)
                    continue
                // Object array
                case 'array':
                    // Single elements are wrapped into an array
                    let o: any[] = Array.isArray(foreign) ? foreign : [foreign]
                    await arrCall({ obj: doc, key: local }, o, data)
                    continue
                // Object step object
                case 'step':
                    if (typeof foreign !== 'object') {
                        throw this.error(
                            'forEachForeignKey',
                            HTTPStatus.BAD_REQUEST,
                            'Unexpected type',
                            `${JSON.stringify(
                                foreign
                            )} was expected to be a step object`
                        )
                    }
                    await stpCall({ obj: doc, key: local }, <any>foreign, data)
                    continue
                default:
                    throw this.internal(
                        'forEachForeignKey',
                        `${data} has invalid .type field (expected foreign key)`
                    )
            }
        }

        return doc
    }

    /**
     * Constructs a DataManager instance with the passed fields and options.
     *
     * @param fieldData The fields and their metadata
     */
    constructor(
        className: string,
        protected fieldData: { [key: string]: IFieldData },
        opts?: {
            // createdAt timestamp
            hasCreate?: boolean
            // updatedAt timestamp
            hasUpdate?: boolean
            // default key to use for filtering
            defaultFilter?: string
        }
    ) {
        super(className)

        this.hasCreate = opts?.hasCreate ?? false
        this.hasUpdate = opts?.hasUpdate ?? false

        if (this.hasCreate) {
            fieldData['createdAt'] = { type: 'string' }
        }
        if (this.hasUpdate) {
            fieldData['updatedAt'] = { type: 'string' }
        }

        this.fieldEntries = Object.entries(fieldData)
        this.foreignEntries = []
        this.dataEntries = []
        this.parentField = null

        // Fill field entries and cached values
        for (let [key, data] of this.fieldEntries) {
            // Set data names
            data.name = key
            if (data.type === 'fkey' || data.instance === 'fkey') {
                this.foreignEntries.push([key, data as IForeignFieldData])
            } else if (data.type === 'data' || data.instance === 'data') {
                this.dataEntries.push([key, data as IDataFieldData])
            } else if (data.type === 'parent' && data.parentReferenceKey) {
                this.parentField = {
                    local: key,
                    foreign: data.parentReferenceKey,
                }
            }
            // Hidden and dummy fields don't actually exist
            if (data.hidden || data.dummy) {
                data.hideGetAll = true
                data.hideGetId = true
                data.hideGetRef = true
            }
        }
    }

    /**
     * Converts a document of mixed objects and foreign keys into a
     * database-safe object, ready for uploading. The final document (and any
     * necessary sub documents) are added to `map`, so all documents can be
     * added to the database at the same time. This avoids issues where an error
     * during parsing would leave documents half-uploaded.
     *
     * This process is *very* expensive, especially for Projects, mostly due to
     * the inefficiencies of the process due to keeping it generic. Thankfully,
     * this is only used on administrative routes, where mixed data is allowed.
     *
     * @param user The user that started the upload
     * @param files Any files with the upload
     * @param doc The document to prepare
     * @param exists True if this document exists in the database
     * @param map The map to add all documents to
     * @param lastDBId The last valid database `ID`. Used for setting parent
     * fields of sub-ojects.
     * @return doc, but with all foreign keys as `ID`s
     */
    protected async prepareDocumentForUpload(
        user: AuthUser,
        files: any,
        doc: Type,
        exists: boolean,
        map: Map<DataManager<any>, any[]>,
        lastDBId: string
    ): Promise<Type> {
        // Modify this document, if required
        if (this.modifyDoc) {
            doc = await this.modifyDoc(user, files, doc)
        }

        // Set create/update
        if (this.hasCreate && !exists) {
            ;(<ICreateUpdate>doc).createdAt = new Date().toJSON()
        }
        if (this.hasUpdate) {
            ;(<ICreateUpdate>doc).updatedAt = new Date().toJSON()
        }

        // Check for extra fields
        for (const [pK, pV] of Object.entries(doc)) {
            if (pK in this.fieldData) continue

            // Developer routes
            if (config.devRoutes) {
                // Clean existing documents
                if (exists) {
                    console.warn(
                        `deleting key ${
                            this.className
                        }.${pK} from existing doc [${JSON.stringify(doc)}]`
                    )
                    delete (<any>doc)[pK]
                    continue
                }
            }

            throw this.error(
                'addToReferenceMap',
                HTTPStatus.BAD_REQUEST,
                'Excess data provided',
                `${
                    this.className
                }.${pK} [${pV}] was not expected in (${JSON.stringify(doc)})`
            )
        }

        // The document currently in the DB with this ID
        let fetched: any
        // Id. Either a valid ID if this is a foreign document or undefined
        let id = (<any>doc).id

        doc = await this.updateEachField(
            doc,
            // all
            async (pointer, data) => {
                let k = pointer.key
                let o = pointer.obj
                // Check for missing fields
                if (k in o) {
                    if (
                        // If the data is hidden but exists in the database,
                        // its an attempted override
                        data.hidden &&
                        exists
                    ) {
                        console.warn(
                            `Overriding hidden key ${str(data)} in doc`
                        )
                        return false
                        // throw this.error(
                        //     'verifyAddedDocument.mapEachField',
                        //     HTTPStatus.BAD_REQUEST,
                        //     'Invalid document',
                        //     `Attempted to override key ${str(data)} in doc`
                        // )
                    } else if (
                        // Remove null-like fields
                        o[k] === undefined ||
                        o[k] === null ||
                        o[k] === ''
                    ) {
                        delete o[k]
                    } else {
                        if (data.type === 'step') {
                            // Fix stepper objects. Very expensive.
                            o[k] = fixStepper(o[k])
                        } else if (
                            data.type === 'string' &&
                            !data.preserveWhitespace
                        ) {
                            // Trim whitespace
                            o[k] = (<string>o[k]).trim()
                        }
                        return false
                    }
                }
                // Fill in default field
                if (data.default !== undefined) {
                    console.warn(
                        `Using default ${data.default} for ${String(k)}`
                    )
                    o[k] = data.default
                    return false
                } else if (data.optional) {
                    console.warn(
                        `optional key ${String(k)} for ${str(data)} dne`
                    )
                    return true
                } else if (exists) {
                    // Pull missing elements from the database
                    if (!fetched) {
                        if (!(<any>this).db) {
                            throw this.internal(
                                'verifyAddedDocument.mapEachField',
                                `${this.className} is not a DBManager, yet contains a missing element and exists in the DB.`
                            )
                        }
                        try {
                            console.log(
                                `Missing field ${String(
                                    k
                                )} in ${o}, checking DB`
                            )
                            fetched = await (<any>this).db.get(id)
                        } catch (e) {
                            console.warn('Error with check')
                            return false
                        }
                    }
                    o[k] = fetched[k]
                    // Elements in the db are assumed to be valid
                    return true
                }
                throw this.error(
                    'verifyAddedDocument.mapEachField',
                    HTTPStatus.BAD_REQUEST,
                    'Missing required field',
                    `${str(k)} dne in ${JSON.stringify(o)}`
                )
            },
            // foreign
            async (v, d) =>
                d.foreignManager.referenceFieldInDoc(
                    user,
                    files,
                    v,
                    d,
                    map,
                    id ?? lastDBId
                ),
            // data
            async (v, d) =>
                d.dataManager.referenceFieldInDoc(
                    user,
                    files,
                    v,
                    d,
                    map,
                    id ?? lastDBId
                ),
            // other
            async (value, data) => {
                if (typeof value === data.type) {
                    return value
                }
                throw this.error(
                    'verifyAddedDocument.mapEachField',
                    HTTPStatus.BAD_REQUEST,
                    'Invalid document field type',
                    `${this.className}.${data.name} ${value} expected to be ${
                        data.type
                    } (got ${typeof value}) for ${str(data)}`
                )
            },
            // parent
            async (value, data) => {
                if (typeof value === 'string') {
                    return data.parentManager
                        ? data.parentManager.db.asId(value)
                        : value
                }
                throw this.internal(
                    'verifyAddedDocument.mapEachField',
                    `${value} ${str(data)} not a valid parent id`
                )
            }
        )

        // Add the document to the map
        concatOrSetMapArray<DataManager<any>, any>(map, this, doc)

        return doc
    }

    /**
     * Converts a passed object or string into an `ID` for the manager
     * referenced by data or into a parsed object if it isn't a database object.
     *
     * Sets parent fields and converts strings into new documents.
     *
     * @param user The user of the request
     * @param files Any files with the request
     * @param doc The document to convert
     * @param data The field data associated with where this sub-document came
     * from
     * @param map The create/update map
     * @param par The parent of this document's `ID`
     */
    protected async referenceFieldInDoc(
        user: AuthUser,
        files: any,
        doc: any,
        data: IFieldData,
        map: Map<DataManager<any>, any[]>,
        par: string
    ): Promise<any> {
        // Doc is either a foreign key or a string to serialize
        if (typeof doc === 'string') {
            // Verify foreign reference
            if (data.foreignManager) {
                let db = data.foreignManager.db
                // Check if foreign key reference is valid
                if (db.isKeyOrId(doc)) {
                    let id = db.asId(doc)
                    if (await db.tryExists(id)) {
                        return id
                    }
                    console.warn(`key ${doc} is a KEY or ID but DNE`)
                }
                console.warn(
                    `expected key of ${str(data)}, got ${doc}, trying bfs`
                )
            }

            // Check if we can build a doc from a string here
            if (!data.acceptNewDoc || !this.buildFromString) {
                throw this.error(
                    'parseGet',
                    HTTPStatus.BAD_REQUEST,
                    'Invalid key value',
                    `[${doc}] is not a valid string entry`
                )
            }

            // Build a new document from a string
            let built = await this.buildFromString(user, files, doc, par)
            // Verify id and add to call stack
            let id = (<any>built).id
            if (data.foreignManager) {
                if (!id || !data.foreignManager.db.isDBId(id)) {
                    throw this.internal(
                        'parseGet',
                        `buildFromString on ${this.className} returns document without id field`
                    )
                }
            }
            built = await this.prepareDocumentForUpload(
                user,
                files,
                built,
                false,
                map,
                id ?? par
            )
            // Return either the id reference or the built object
            return data.foreignManager ? id : built
            // Objects are fully-formed documents
        } else if (typeof doc === 'object') {
            // Update parent field only if it isn't already set
            // TODO: validate existing parent keys
            if (this.parentField) {
                let local = this.parentField.local
                if (!doc[local]) {
                    // We're assigning the parent/module/project field of documents here, so they hold references to their parent.
                    doc[local] = par
                }
            }

            // Non-foreign documents are verified directly
            if (!data.foreignManager) {
                return this.prepareDocumentForUpload(
                    user,
                    files,
                    doc,
                    false,
                    map,
                    par
                )
            }

            let db = data.foreignManager.db
            let id: string = doc.id
            let exists = false

            // doc.id is either null (new document) or KEY
            if (id) {
                // Check if it is an id or key
                id = db.asId(id)
                exists = await db.exists(id)

                // If this is new
                if (!exists) {
                    // And we allow new documents
                    if (!data.acceptNewDoc) {
                        throw this.error(
                            'parseGet',
                            HTTPStatus.BAD_REQUEST,
                            'New document unauthorized',
                            `New documents [${JSON.stringify(
                                doc
                            )}] not acceptable for type ${str(data)}`
                        )
                    }

                    // Generate new id
                    id = db.generateDBID()
                }
            } else {
                // If there is no id field, it is assumed to not exist
                if (!data.acceptNewDoc) {
                    throw this.error(
                        'parseGet',
                        HTTPStatus.BAD_REQUEST,
                        'New document unauthorized',
                        `New documents [${JSON.stringify(
                            doc
                        )}] not acceptable for type ${str(data)}`
                    )
                }
                id = db.generateDBID()
            }

            // Set new/modified id
            doc.id = id
            await this.prepareDocumentForUpload(
                user,
                files,
                doc,
                exists,
                map,
                id
            )
            return id
        }
        throw this.error(
            'ref',
            HTTPStatus.BAD_REQUEST,
            'Invalid foreign object',
            `[${JSON.stringify(
                doc
            )}] is not a foreign document or reference for data [${str(data)}]`
        )
    }

    /**
     * Called by GET-ALL and GET-ID requests. Converts all `ID`s in the document
     * into `KEY`s for presentation on the frontend.
     *
     * @param user The user for this request
     * @param doc The document to convert keys for
     * @return The updated document
     */
    public async convertIDtoKEY(user: AuthUser, doc: Type): Promise<Type> {
        return this.updateEachField(
            doc,
            // all
            async (p, data) => {
                if (
                    !(p.key in p.obj) ||
                    p.obj[p.key] === undefined ||
                    p.obj[p.key] === null
                ) {
                    if (data.default !== undefined) {
                        // Put default value in
                        p.obj[p.key] = data.default
                    } else if (!data.hideGetAll) {
                        console.warn(`${String(p.key)} missing in GET/ ${doc}`)
                    }
                    return true
                }
                return false
            },
            // foreign
            (v, d) => {
                if (typeof v === 'string' && d.foreignManager.db.isDBId(v)) {
                    return splitId(v).key
                } else if (typeof v === 'object') {
                    // d.distortOnGet(v)
                    return v
                }
                throw this.internal(
                    'convertIds',
                    `${this.className} [${v}] expected to be a DB id for ${d.foreignManager.db.className} (${d})`
                )
            },
            // data
            (v, d) => {
                if (typeof v === 'object') {
                    return d.dataManager.convertIDtoKEY(user, v)
                }
                throw this.internal(
                    'convertIds',
                    `${this.className} [${v}] expected to be an object`
                )
            },
            // other
            undefined,
            // parent
            async (v, d) => convertToKey(v)
        )
    }
}
