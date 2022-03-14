export interface LoginInformation {
     username: string,
     password: string
}

export type Status = "IN_PROGRESS" | "COMPLETED" | "ARCHIVED" | "AWAITING";
export type TaskTypes = "DOCUMENT_UPLOAD" | "DOCUMENT_REVIEW" | "MODULE_WAIVER" | "MODULE_WAIVER_APPROVAL"

// All are optional
export interface IArangoIndexes {
     _id?: string;
     _rev?: string;
     _key?: string;

     id?: string;
}


export interface ITaskStep {
     [id: number | string]: ITask[] | string[]
}
export interface IModuleStep {
     [id: number | string]: IModule[] | string[]
}
// DB elements with create/update timestamps
export interface ICreateUpdate {
     createdAt?: string | Date;
     updatedAt?: string | Date;
}

export interface IUser extends IArangoIndexes {
     firstName: string;
     lastName: string;
     avatar: null | string;
     rank: string | IRank;

     username: string;
     password: string;
}

export interface IComment extends IArangoIndexes, ICreateUpdate {
     content: string;
     author: string | IUser;
     parent?: string | IModule | IProject;
}

export interface ITask extends IArangoIndexes {
     title: string;
     status: Status;
     users?: Array<string> | Array<IUser>;
     userGroup?: string;
     module?: string | IModule;
     type?: TaskTypes;
}

export interface ITaskReview extends ITask {
     type: "DOCUMENT_REVIEW";
}

export interface ITaskUpload extends ITask {
     type: "DOCUMENT_UPLOAD";
}

export interface ITaskWaiver extends ITask {
     type: "MODULE_WAIVER";
}

export interface ITaskWaiverReview extends ITask {
     type: "MODULE_WAIVER_APPROVAL";
}

export interface IModule extends IArangoIndexes {
     title: string;
     tasks: ITaskStep;
     comments: Array<string> | Array<IComment>;
     project?: string | IProject;
     status: Status | "WAIVED";
     waived: boolean;
}

export interface IProject extends IArangoIndexes, ICreateUpdate {
     title: string;
     start: Date;
     end: Date;
     status: Status;
     comments: Array<string> | Array<IComment>;
     modules: IModuleStep;
     users: Array<string> | Array<IUser>;
}

export interface IRank extends IArangoIndexes {
     name: string;
     permissions?: {
          perm1: boolean;
          perm2: boolean;
          perm3: boolean;
     };
}

export interface IFileMetadata extends IArangoIndexes, ICreateUpdate {
     name: string;
     author: string | IUser;
     blob: File;
}

export interface IModuleTemplate extends IModule, IArangoIndexes {
     description: string;
}

export interface IProjectTemplate extends IArangoIndexes, ICreateUpdate {
     title: string;
     description: string;
     modules: Array<IModule>;
}

export interface IGetListQuery {
     filter: Array<string>;
     range: Array<number>;
     sort: Array<string>;
}