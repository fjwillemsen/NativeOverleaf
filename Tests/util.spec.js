const { fetchAsync, semanticVersionCompare } = require("../Scripts/util");

describe("Local storage", () => {
    test("it should return defautls for keys that do not exist", () => {
        const val = localStorage.getObject("test_localstorage_key_undefined", true);
        expect(val).toBe(true);
        const val_2 = localStorage.getObject("test_localstorage_key_undefined");
        expect(val_2).toBe(undefined);
    });
    test("it should set and retrieve stored values correctly", () => {
        localStorage.setObject("test_localstorage_val", "hello world");
        const val = localStorage.getObject("test_localstorage_val");
        expect(val).toBe("hello world");
    });
    test("it should set and retrieve stored objects correctly", () => {
        const object = {
            hello: "world",
        };
        localStorage.setObject("test_localstorage_object", object);
        const val = localStorage.getObject("test_localstorage_object");
        console.log(val);
        expect(val).toMatchObject(object);
    });
});
