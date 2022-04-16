import { IStepper } from './util'

export type Status = 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED' | 'AWAITING'
export type TaskTypes =
    | 'DOCUMENT_UPLOAD'
    | 'DOCUMENT_REVIEW'
    | 'MODULE_WAIVER'
    | 'MODULE_WAIVER_APPROVAL'
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'INACTIVE' | 'SUSPENDED'

// All are optional
export interface IArangoIndexes {
    _id?: string
    _rev?: string
    _key?: string

    id?: string
}

// DB elements with create/update timestamps
export interface ICreateUpdate {
    createdAt?: string | Date
    updatedAt?: string | Date
}

export interface IComment extends IArangoIndexes, ICreateUpdate {
    content: string
    author: string | IUser
    parent?: string
}

export interface IFile extends IArangoIndexes, ICreateUpdate {
    title: string
    author: string | IUser
    src?: string
    path?: string
}

export interface IFilemeta extends IArangoIndexes, ICreateUpdate {
    latest: string | IFile
    reviews: string[] | IFile[]
    old: string[] | IFile[]
    oldReviews: string[] | IFile[]
    module: string
}

export interface IModuleTemplate extends IArangoIndexes {
    ttc?: number
    title: string
    tasks: IStepper<ITaskTemplate>
    status: Status | 'WAIVED'
}

export interface IWaiveData {
    comment: string | IComment
    file: string | IFilemeta
    author: string | IUser
}

export interface IModule extends IArangoIndexes {
    ttc?: number
    suspense?: string | Date
    title: string
    tasks: IStepper<ITask> | IStepper<string>
    comments: Array<string> | Array<IComment>
    status: Status | 'WAIVED'
    project?: string

    files: IFilemeta[]
    waive?: IWaiveData
}

export interface IProjectTemplate extends IArangoIndexes, ICreateUpdate {
    ttc?: number
    title: string
    status: Status
    modules: IStepper<IModuleTemplate> | IStepper<string>
}

export interface IProject extends IArangoIndexes, ICreateUpdate {
    title: string
    start: string | Date
    suspense: string | Date
    ttc?: number
    status: Status
    modules: IStepper<IModule> | IStepper<string>
    users: Array<string> | Array<IUser>
    team?: string | ITeam
}

export type ApiPerm = keyof IPermission
export type FetchType = 'ASSIGNED' | 'TEAM' | 'ALL'

export interface IPermission {
    taskFetching: FetchType
    projectFetching: FetchType
}

export const defaultPermissions: IPermission = {
    taskFetching: 'ASSIGNED',
    projectFetching: 'ASSIGNED',
}

export interface IRank extends IArangoIndexes {
    name: string
    permissions?: IPermission
}

export interface ITaskTemplate extends IArangoIndexes {
    title: string
    rank?: string
    type: TaskTypes
    status: Status
}

export interface ITask extends IArangoIndexes {
    suspense?: string | Date
    ttc?: number
    title: string
    status: Status
    users: Array<string> | Array<IUser>
    rank?: string
    module?: string | IModule
    type: TaskTypes
}

export interface IUser extends IArangoIndexes {
    firstName: string
    lastName: string
    avatar: null | string
    rank: string | IRank
    status: UserStatus

    username: string
    password: string
    firstVisited: string
    lastVisited: string
}

export interface ITeam extends IArangoIndexes {
    name: string
    users: IUser[] | string[]
}

export interface INotification extends IArangoIndexes {
    recipient: string | IUser
    sender: ISender
    content: string
    read: boolean
    type: NotificationType
    createdAt: string
}

export type NotificationType = 'PROJECT' | 'MODULE' | 'TASK' | 'USER'
export type ResourceType = 'projects' | 'users' | 'modules' | 'tasks'

export interface ISender {
    resource: ResourceType
    // THIS IS A KEY !!!
    id: string
}

export interface IUserLog extends IArangoIndexes {
    content: string
    sender: ISender
    project?: string
    module?: string
    task?: string
}
