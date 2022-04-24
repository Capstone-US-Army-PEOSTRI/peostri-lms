import { ArangoWrapper } from '../../../database'
import { HTTPStatus } from '../../../lms/errors'
import { IFilemeta, ITask } from '../../../lms/types'
import { getFile } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { FilemetaManager, IFileData } from './filemeta'
import { FiledataManager } from './files'
import { ModuleManager } from './modules'

class Task extends DBManager<ITask> {
    constructor() {
        super(
            'tasks',
            'Task',
            {
                title: { type: 'string' },
                status: {
                    type: 'string',
                    default: 'AWAITING',
                },
                users: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'users',
                    default: [],
                    getIdKeepAsRef: true,
                },
                suspense: {
                    type: 'string',
                    optional: true,
                },
                rank: {
                    type: 'fkey',
                    managerName: 'ranks',
                    optional: true,
                    getIdKeepAsRef: true,
                },
                module: {
                    type: 'parent',
                    managerName: 'modules',
                    parentReferenceKey: 'tasks',
                },
                // Parent key for project
                project: {
                    type: 'string',
                    optional: true,
                },
                type: { type: 'string' },
                ttc: {
                    type: 'number',
                    optional: true,
                },
            },
            {
                defaultFilter: 'title',
            }
        )
    }

    private async preProcessingChecks(
        taskId: string,
        files: any,
        fileKey: string
    ) {
        // Verify file exists
        let fileData = getFile(files, fileKey)

        // Retrieve task
        let task = await this.db.get(taskId)
        if (!task.module) {
            throw this.internal(
                'upload',
                `Task ${taskId} could not find its parent`
            )
        }

        // Retrieve module
        await ModuleManager.db.assertIdExists(task.module)
        let mod = await ModuleManager.db.get(task.module)

        return { fileData, modId: task.module, mod }
    }

    private async saveFile(user: AuthUser, fileData: IFileData) {
        // Save file
        let review = await FiledataManager.writeFile(user, fileData)
        if (!review.id) {
            throw this.internal('upload', `file ${review} lacks .id field`)
        }
        // Necessary to cache this value here, db.save clears it
        let fileId = review.id
        await FiledataManager.db.save(review)

        return fileId
    }

    /**
     * COMPLETE
     */
    public async complete(user: AuthUser, taskId: string) {
        await this.db.updateFaster([taskId], 'status', 'COMPLETE')
        let modId = await this.db.getOneFaster<string>(taskId, 'module')
        await ModuleManager.automaticAdvance(user, modId)
    }

    /**
     * UPLOAD
     */
    public async upload(
        user: AuthUser,
        taskId: string,
        files: any,
        fileKey: string
    ) {
        // Check/retrieve data
        let { mod, modId, fileData } = await this.preProcessingChecks(
            taskId,
            files,
            fileKey
        )

        // Save file
        let fileId = await this.saveFile(user, fileData)

        // Build/modify filemeta
        let filemeta: IFilemeta = {} as any
        if (mod.files) {
            let filemeta = await FilemetaManager.db.get(mod.files as string)

            FilemetaManager.pushLatest(filemeta, fileId)

            // Update filemeta
            await FilemetaManager.db.update(filemeta, { mergeObjects: false })
        } else {
            // Build a new filemeta object
            filemeta = {
                id: FilemetaManager.db.generateDBID(),
                latest: fileId,
                reviews: [],
                old: [],
                oldReviews: [],
                module: modId,
            }

            mod.files = filemeta.id
            // Update filemeta
            await FilemetaManager.db.save(filemeta)
            await ModuleManager.db.update(mod, { mergeObjects: false })
        }

        // Update task and ADVANCE
        await this.db.updateFaster([taskId], 'status', 'COMPLETED')
        await ModuleManager.postAutomaticAdvance(user, mod)
    }

    /**
     * REVIEW
     */
    public async review(
        user: AuthUser,
        taskId: string,
        files: any,
        fileKey: string
    ) {
        let { mod, modId, fileData } = await this.preProcessingChecks(
            taskId,
            files,
            fileKey
        )

        // If files dont exist, we can't proceed
        if (!mod.files) {
            // Throw an error, we need to upload a file first
            throw this.error(
                'review',
                HTTPStatus.BAD_REQUEST,
                'Invalid module state.',
                `${JSON.stringify(mod)} lacks filemeta object`
            )
        }

        // Save file
        let fileId = await this.saveFile(user, fileData)

        // Get filemeta
        let filemeta = await FilemetaManager.db.get(mod.files as string)
        // Modify filemeta
        filemeta.reviews = (<string[]>filemeta.reviews).concat(fileId)
        // Update filemeta
        await FilemetaManager.db.update(filemeta, { mergeObjects: false })

        // Update task and ADVANCE
        await this.db.updateFaster([taskId], 'status', 'COMPLETED')
        await ModuleManager.postAutomaticAdvance(user, mod)
    }

    /**
     * REVISE
     */
    public async revise(
        user: AuthUser,
        taskId: string,
        files: any,
        fileKey: string,
        reviseFileKey: string
    ) {
        let { mod, modId, fileData } = await this.preProcessingChecks(
            taskId,
            files,
            fileKey
        )

        // If files dont exist, we can't proceed
        if (!mod.files) {
            // Throw an error, we need to upload a file first
            throw this.error(
                'review',
                HTTPStatus.BAD_REQUEST,
                'Invalid module state.',
                `${JSON.stringify(mod)} lacks filemeta object`
            )
        }

        // Get filemeta
        let filemeta = await FilemetaManager.db.get(mod.files as string)

        // Cache revise file
        let reviseFileId = FiledataManager.db.asId(reviseFileKey)

        // Locate revised file
        let found = false
        for (let i = 0; i < filemeta.reviews.length; i++) {
            let r = filemeta.reviews[i]
            if (r === reviseFileId) {
                // Remove from reviews
                filemeta.reviews.splice(i, 1)
                // Push into oldReviews
                filemeta.oldReviews = (<string[]>filemeta.oldReviews).concat(r)
                found = true
                break
            }
        }
        if (!found) {
            throw this.error(
                'revise',
                HTTPStatus.BAD_REQUEST,
                'Invalid revise key',
                `${reviseFileKey} -> ${reviseFileId} not a valid fieldata key`
            )
        }

        // Save file
        let fileId = await this.saveFile(user, fileData)

        // Push latest
        FilemetaManager.pushLatest(filemeta, fileId)

        // Update filemeta
        await FilemetaManager.db.update(filemeta, { mergeObjects: false })

        // Update task and ADVANCE
        await this.db.updateFaster([taskId], 'status', 'COMPLETED')
        await ModuleManager.postAutomaticAdvance(user, mod)
    }

    /**
     * APPROVE
     */
    public async approve(user: AuthUser, taskId: string) {
        await this.db.updateFaster([taskId], 'status', 'COMPLETE')
        let modId = await this.db.getOneFaster<string>(taskId, 'module')
        await ModuleManager.automaticAdvance(user, modId)
    }
}

export const TaskManager = new Task()
