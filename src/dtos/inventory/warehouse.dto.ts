import {
    IsString,
    IsNotEmpty,
} from 'class-validator';

export class WarehouseDTO {
    name: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    constructor(data: any) {
        this.name = data.name;
        this.location = data.location;
    }
}