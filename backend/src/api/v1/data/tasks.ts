import { IGetAllQueryResults } from '../../../database'
import { ITask } from '../../../lms/types'
import { DBManager } from '../DBManager'
import { RankManager } from './ranks'
import { UserManager } from './users'

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
                    default: [],
                    getIdKeepAsRef: true,
                    foreignApi: UserManager,
                },
                suspense: {
                    type: 'string',
                    optional: true,
                },
                rank: {
                    type: 'fkey',
                    optional: true,
                    getIdKeepAsRef: true,
                    foreignApi: RankManager,
                },
                module: {
                    type: 'parent',
                    parentReferenceKey: 'tasks',
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
}

export const TaskManager = new Task()
