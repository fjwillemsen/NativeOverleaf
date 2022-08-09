require("jest-fetch-mock").enableMocks();
const { fetchAsync, semanticVersionCompare } = require("../Scripts/update");

describe("Update functionality", () => {
    test("it should retrieve the tags correctly", async () => {
        const mockresponse = `[{"name": "v1.4.0","zipball_url": "https://api.github.com/repos/fjwillemsen/NativeOverleaf/zipball/refs/tags/v1.4.0","tarball_url": "https://api.github.com/repos/fjwillemsen/NativeOverleaf/tarball/refs/tags/v1.4.0","commit": {"sha": "94cdc9c0e7483663dea2a32271079d07e7ddb610", "url": "https://api.github.com/repos/fjwillemsen/NativeOverleaf/commits/94cdc9c0e7483663dea2a32271079d07e7ddb610"},"node_id": "REF_kwDOHs1SOLByZWZzL3RhZ3MvdjEuNC4w" }]`;
        fetch.mockResponseOnce(mockresponse);
        const correct_url_result = await fetchAsync("https://api.github.com/repos/fjwillemsen/NativeOverleaf/tags");
        expect(correct_url_result.length).toBe(1);
        expect(correct_url_result[0].name).toBe("v1.4.0");
    });
    test("it should compare versions correctly", () => {
        expect(semanticVersionCompare("1.0.0", "1.0.0")).toBe(0);
        expect(semanticVersionCompare("1.0.0", "1.0.1")).toBe(-1);
        expect(semanticVersionCompare("2.0.0", "1.9.0")).toBe(1);
    });
});
