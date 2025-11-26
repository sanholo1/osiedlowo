export interface LoginForm {
    email: string;
    password: string;
}

export interface RegisterForm extends LoginForm {
    firstName: string;
    lastName: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    address?: string;
}

export interface AuthResponse {
    status: string;
    data: {
        token: string;
        user: User;
    };
}
