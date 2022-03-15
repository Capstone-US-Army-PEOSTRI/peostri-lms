export type Status = "IN_PROGRESS" | "COMPLETED" | "ARCHIVED" | "AWAITING";
export type TaskTypes = "DOCUMENT_UPLOAD" | "DOCUMENT_REVIEW" | "MODULE_WAIVER" | "MODULE_WAIVER_APPROVAL"

// All are optional
export interface IArangoIndexes {
     _id?: string;
     _rev?: string;
     _key?: string;

     id?: string;
}

// DB elements with create/update timestamps
export interface ICreateUpdate {
     createdAt?: string | Date;
     updatedAt?: string | Date;
}

export interface IComment extends IArangoIndexes, ICreateUpdate {
     content: string;
     author: string | IUser;
     parent?: string;
}

export interface IFileMetadata extends IArangoIndexes, ICreateUpdate {
     name: string;
     author: string | IUser;
}

export interface IModuleTemplate extends IArangoIndexes {
     title: string;
     description: string;
     tasks: { [id:string]: ITaskTemplate[] };
     'waive-module': boolean;
}

export interface IModule extends IArangoIndexes {
     title: string;
     tasks: { [id:string]: ITask[] | string[] };
     comments: Array<string> | Array<IComment>;
     project?: string;
     status: Status | "WAIVED";
     'waive-module': boolean;
     file: string | IFileMetadata;
}

export interface IProjectTemplate extends IArangoIndexes, ICreateUpdate {
     title: string;
     description: string;
     modules: Array<IModule>;
}

export interface IProject extends IArangoIndexes, ICreateUpdate {
     title: string;
     start: Date;
     end: Date;
     status: Status;
     comments: Array<string> | Array<IComment>;
     modules: { [id:string]: IModule[] | string[] };
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

export interface ITaskTemplate extends IArangoIndexes {
     title: string;
     description: string;
     rank?: string
     type: TaskTypes
}

export interface ITask extends IArangoIndexes {
     title: string;
     status: Status;
     users: Array<string> | Array<IUser>;
     rank?: string;
     module?: string | IModule;
     type: TaskTypes;
}

export interface IUser extends IArangoIndexes {
     firstName: string;
     lastName: string;
     avatar: null | string;
     rank: string | IRank;

     username: string;
     password: string;
}
