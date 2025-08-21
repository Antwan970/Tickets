export type Employee = {
 id?: number;
  FirstName: string;
  LastName: string;
  UserName: string;
  Email: string;
  Password?: string;
  Age: number;
};

export interface UserItem {
  id?: number;
  Firstname: string;
  Lastname: string;
  UserName: string;
  Email: string;
  Password?: string;
  Age: number;
}

export type UserResponse = {
  data: UserItem[];
  meta: {
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
};