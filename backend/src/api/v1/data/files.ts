import Router from '@koa/router'
import { aql } from 'arangojs/aql'
import fs from 'fs'
import path from 'path'
import { config } from '../../../config'
import { HTTPStatus } from '../../../lms/errors'
import { IFileMetadata, IFileRevisions } from '../../../lms/types'
import { generateBase64UUID, getUrl } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { IFileData } from './filemeta'

const FILE_PATH = path.join('fs')
export const FULL_FILE_PATH = path.resolve(config.basePath, FILE_PATH)
const FILE_404 = path.join('404.pdf')

/**
 * Filedata. Stores where a file is located and its static path URL.
 */
export class Filedata extends DBManager<IFileMetadata> {
    constructor() {
        super(
            'files',
            'File',
            {
                title: { type: 'string' },
                author: {
                    type: 'fkey',
                    managerName: 'users',
                },
                pathTo: {
                    type: 'string',
                    hidden: true,
                },
            },
            {
                hasCreate: true,
                defaultFilter: 'title',
            }
        )
    }

    // Overrides deletion to delete the file from disk
    public override async delete(user: AuthUser, id: string): Promise<void> {
        let path = await this.db.getOneField<string>(id, 'pathTo')
        await super.delete(user, id)
        // Delete the file after super.delete completes in case of errors
        await this.deleteFile(user, path)
    }

    // Generates the SRC url path
    public override async getFromDB(
        user: AuthUser,
        id: string,
        noDeref: boolean,
        userRoute: boolean
    ): Promise<IFileMetadata> {
        let f = await super.getFromDB(user, id, noDeref, userRoute)

        // Generate src path
        f.src = this.getStaticUrl(f)

        return f
    }

    // Generates the SRC url path
    public override async convertIDtoKEY(
        user: AuthUser,
        doc: IFileMetadata
    ): Promise<IFileMetadata> {
        let f = await super.convertIDtoKEY(user, doc)

        // Generate src path
        f.src = this.getStaticUrl(f)

        return f
    }

    /**
     * Gets a static url to the given file.
     *
     * @param file A FileData-like string
     * @return A URL string
     */
    public getStaticUrl(file: { id?: string; title: string }) {
        return getUrl(`files/static/${file.id}/${file.title}`)
    }

    /**
     * Write a new file from the file data. Also writes it to the disk.
     *
     * @param user The user for the request
     * @param file The file data to update
     * @return The file metadata object
     */
    public async writeFile(
        user: AuthUser,
        file: IFileData
    ): Promise<IFileMetadata> {
        let key = generateBase64UUID()
        let pathTo: string = key + '-' + file.name

        if (config.spoofFileSave) {
            // Move file from OS 'tmp' to the LMS 'fs' directory
            await fs.promises.rename(
                file.path,
                path.join(FULL_FILE_PATH, pathTo)
            )
        }

        return {
            id: this.db.keyToId(key),
            pathTo,
            title: file.name,
            author: user.id,
            createdAt: new Date().toJSON(),
        }
    }

    /**
     * Delete a file from the filesystem.
     *
     * @param user The user for the request
     * @param pathTo The path string on disk. Read from the file metadata.
     */
    public async deleteFile(user: AuthUser, pathTo: string) {
        let fullPath = path.join(FULL_FILE_PATH, pathTo)

        if (fs.existsSync(fullPath)) {
            if ((await fs.promises.stat(fullPath)).isFile()) {
                fs.unlinkSync(fullPath)
            } else {
                throw this.internal(
                    'deleteFile',
                    `pathTo ${fullPath} is not a file.`
                )
            }
        } else {
            if (config.releaseFileSystem) {
                throw this.internal('deleteFile', `Path ${pathTo} dne`)
            } else {
                console.log(`Path ${pathTo} dne`)
            }
        }
    }

    /**
     * Reads the latest file path.
     *
     * @param user The user for the request
     * @param doc The revisions file
     * @return A path to return the string with
     */
    public async readLatest(user: AuthUser, doc: IFileRevisions) {
        return this.readSource(user, (<IFileMetadata>doc.latest).pathTo)
    }

    /**
     * Reads a file from its `ID`.
     *
     * @param user The user for the request
     * @param id A file database `ID`
     * @return A path to return the string with
     */
    public async read(user: AuthUser, id: string) {
        let pathTo = await this.db.getOneField<string>(id, 'pathTo')
        return this.readSource(user, pathTo)
    }

    /**
     * Converts a `pathTo` variable into a full path.
     *
     * @param user The user for the request
     * @param pathTo The base path
     * @return A full path variable
     */
    public async readSource(user: AuthUser, pathTo: string) {
        let fullPath = path.join(FULL_FILE_PATH, pathTo ?? '')

        // Check if path exists
        if (fs.existsSync(fullPath)) {
            // Check if path is a file
            if ((await fs.promises.stat(fullPath)).isFile()) {
                return pathTo
            }
        }

        // If we're not on release filesystem, return 404.pdf
        if (!config.releaseFileSystem) {
            console.log(`File [${fullPath}] dne, using 404.pdf instead`)
            return FILE_404
        } else {
            throw this.internal('readLatest', `${fullPath} is not a file`)
        }
    }

    /**
     * Deletes all files that no longer have any file revisions associated with
     * them.
     */
    public async deleteLostFiles() {
        return this.db.rawQuery(
            aql`let v=(for f in files for m in filemeta filter f._id == m.latest or CONTAINS(m.old, f._id) or CONTAINS(m.reviews, f._id) or CONTAINS(m.oldReviews, f._id) return f._id) for f in files filter not CONTAINS(v, f._id) remove f in files`
        )
    }

    // Adds deleteLostFiles as `/lost`
    public override debugRoutes(r: Router): void {
        super.debugRoutes(r)
        r.delete('/lost', async (ctx) => {
            await this.deleteLostFiles()
            ctx.status = HTTPStatus.OK
        })
    }
}

export const FiledataManager = new Filedata()
