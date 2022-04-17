import bcrypt from 'bcrypt'
import { IUser } from '../../../lms/types'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { UserArangoWrapper } from './UserArangoWrapper'

export const DB_NAME = 'users'

class User extends DBManager<IUser> {
    public async getUser(id: string): Promise<IUser> {
        return this.db.get(id)
    }

    constructor() {
        super(
            DB_NAME,
            'User',
            {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                avatar: { type: 'string' },
                rank: {
                    type: 'fkey',
                    managerName: 'ranks',
                    getIdKeepAsRef: true,
                    acceptNewDoc: false,
                },
                teams: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'teams',
                    optional: true,
                    getIdKeepAsRef: true,
                    default: [],
                },
                status: {
                    type: 'string',
                    default: 'ACTIVE',
                },
                email: {
                    type: 'string',
                    optional: true,
                },
                // Auth data
                username: {
                    type: 'string',
                    hideGetRef: true,
                },
                password: {
                    type: 'string',
                    hideGetAll: true,
                    hideGetId: true,
                    hideGetRef: true,
                },
                firstVisited: {
                    type: 'string',
                    optional: true,
                },
                lastVisited: {
                    type: 'string',
                    optional: true,
                },
                name: {
                    type: 'string',
                    dummy: true,
                },
            },
            {
                // This has custom functionality in UserArangoWrapper
                defaultFilter: 'name',
            }
        )

        this.db = new UserArangoWrapper(this.fieldEntries)
    }

    protected override modifyDoc = async (
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<IUser> => {
        // Hash password
        if (doc.password) {
            if (doc.password === '') {
                delete doc.password
            } else {
                doc.password = await bcrypt.hash(doc.password, 5)
            }
        }
        return doc
    }

    public async getFromUsername(username: string) {
        return (<UserArangoWrapper>this.db).getFromUsername(username)
    }

    // Update the first/lastVisited fields
    public async updateForNewLogin(key: string) {
        let id = this.db.keyToId(key)
        let user = await this.db.get(id)

        if (!user.firstVisited) {
            user.firstVisited = new Date().toJSON()
        }
        user.lastVisited = new Date().toJSON()

        return this.db.update(user, { mergeObjects: false })
    }
}

export const UserManager = new User()
