import { IModule, IWaiveData } from '../../../lms/types'
import { AuthUser } from '../../auth'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'
import { CommentManager } from './comments'
import { FilemetaManager } from './filemeta'
import { UserManager } from './users'

class Waive extends DataManager<IWaiveData> {
    constructor() {
        super('Waive', {
            comment: {
                type: 'fkey',
                foreignApi: CommentManager,
                optional: true,
                freeable: true,
                acceptNewDoc: true,
                distortOnGet: (doc: any) => doc.content,
            },
            file: {
                type: 'fkey',
                foreignApi: FilemetaManager,
                optional: true,
                acceptNewDoc: true,
                distortOnGet: (doc: any) => ({
                    src: `api/v1/files/${doc.id}`,
                    title: doc.latest.title,
                }),
            },
            author: {
                type: 'fkey',
                foreignApi: UserManager,
            },
        })
    }

    protected override modifyDoc = async (
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<IWaiveData> => {
        if (!doc.author) {
            doc.author = user.id
        }
        return doc
    }
}

const WaiveManager = new Waive()

class Module extends DBManager<IModule> {
    constructor() {
        super(
            'modules',
            'Module',
            {
                title: { type: 'string' },
                tasks: {
                    type: 'step',
                    instance: 'fkey',
                    managerName: 'tasks',
                    freeable: true,
                    acceptNewDoc: true,
                },
                comments: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'comments',
                    optional: true,
                    default: [],
                    freeable: true,
                    acceptNewDoc: true,
                },
                project: {
                    type: 'parent',
                    managerName: 'projects',
                    parentReferenceKey: 'modules',
                },
                status: {
                    type: 'string',
                    default: 'AWAITING',
                },
                suspense: {
                    type: 'string',
                    optional: true,
                },
                files: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'filemeta',
                    optional: true,
                    default: [],
                    acceptNewDoc: true,
                },
                waive: {
                    type: 'data',
                    foreignData: WaiveManager,
                    optional: true,
                },
                ttc: {
                    type: 'number',
                    optional: true,
                },
                currentStep: {
                    type: 'number',
                    default: 0,
                },
            },
            {
                defaultFilter: 'title',
            }
        )
    }

    protected override modifyDoc = (
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<IModule> => {
        // Remove front-end waive_module
        delete doc.waive_module

        // Convert a single file into a file array
        if (doc.file) {
            if (doc.files) {
                doc.files.concat(doc.file)
            } else {
                doc.files = [doc.file]
            }
            delete doc.file
        }

        return doc
    }
}

export const ModuleManager = new Module()
