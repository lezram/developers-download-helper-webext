import {Substitute, SubstituteOf} from "@fluffy-spoon/substitute";
import {container} from "tsyringe";

export type ClassType<T> = {
    new(...args: any[]): T;
};

export class Mo {

    public static injectMock<T>(clazz: ClassType<T>): SubstituteOf<T> {
        const mockObject = Substitute.for<T>();
        container.register(clazz, {useValue: mockObject});
        return mockObject;
    }

    public static mock<T>(): SubstituteOf<T> {
        return Substitute.for<T>();
    }
}