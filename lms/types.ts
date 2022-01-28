export interface LoginInformation {
     username: string,
     password: string
}

export type Status = "IN_PROGRESS" | "COMLETED" | "ARCHIVED" | "AWAITING";

// All are optional
interface IArangoIndexes {
     _id?: string;
     _rev?: string;
     _key?: string;
}

export interface IUser extends IArangoIndexes {
     firstName: string;
     lastName: string;
     avatar: null | string;

     id?: string;
}

export interface IComment extends IArangoIndexes {
     content: string;
     author: string | IUser;
     createdAt?: string | Date;
     updatedAt?: string | Date;
     parent?: string | ITask | IModule | IProject;
}

export interface ITask extends IArangoIndexes {
     title: string;
     status: Status;
     assigned?: string | IUser | Array<IUser> | Array<string> | null; //TODO: Should this be a rank instead of a user??
     comments: Array<IComment>;
     parent?: string | IModule;
}

export interface ITaskReview extends ITask, IArangoIndexes {
     type: "DOCUMENT_REVIEW";
}

export interface ITaskUpload extends ITask, IArangoIndexes {
     type: "DOCUMENT_UPLOAD";
}

export interface IModule extends IArangoIndexes {
     title: string;
     tasks: Array<ITask>;
     project?: string | IProject;
}

export interface IProject extends IArangoIndexes {
     title: string;
     createdAt?: Date;
     updatedAt?: Date;
     start: Date;
     end: Date;
     status: Status;
     comments: Array<string> | Array<IComment>;
     modules: Array<string> | Array<IModule>;
     users: Array<string> | Array<IUser>;
     // Required for api. Alias for _key, dne in database
     id?: string;
}

export interface IModuleTemplate extends IModule, IArangoIndexes {
     description: string;
}

export interface IProjectTemplate extends IArangoIndexes {
     title: string;
     description: string;
     createdAt?: Date;
     updatedAt?: Date;
     modules: Array<IModule>;
}