import {expect} from 'chai';
import 'mocha';
import GithubURL from "../../src/background/GithubURL";
import domInit from "../DomTestHelper";
import {FileType} from "../../src/background/FileType";


describe('GithubUrl()', () => {
    const USERNAME = "myUserName";
    const REPOSITORY = "myNewCoolRepo";
    const BRANCH = "MyNonDefaultBranch";
    const FILE_PATH = "src/test.md";

    domInit();


    it('should parse the given url (user/repo)', () => {
        let githubUrl = new GithubURL("http://github.my.com/"+USERNAME+"/"+REPOSITORY);

        expect(USERNAME).to.equal(githubUrl.user);
        expect(REPOSITORY).to.equal(githubUrl.repository);
        expect(FileType.ZIPBALL).to.equal(githubUrl.fileType);
        expect(null).to.equal(githubUrl.branch);
        expect(null).to.equal(githubUrl.filePath);
    });

    it('invalid url should throw exception (user/repo/type)', () => {
        expect(() => new GithubURL("http://github.my.com/"+USERNAME+"/"+REPOSITORY+"/"+FileType.RAW)).to.throw();
    });

    it('invalid url should throw exception (user/)', () => {
        expect(() => new GithubURL("http://github.my.com/"+USERNAME)).to.throw();
    });

    it('should parse the given url (user/repo/type/branch)', () => {
        let githubUrl = new GithubURL("http://github.my.com/"+USERNAME+"/"+REPOSITORY+"/commit/"+BRANCH);

        expect(USERNAME).to.equal(githubUrl.user);
        expect(REPOSITORY).to.equal(githubUrl.repository);
        expect(FileType.ZIPBALL).to.equal(githubUrl.fileType);
        expect(BRANCH).to.equal(githubUrl.branch);
        expect(null).to.equal(githubUrl.filePath);
    });

    it('should parse the given url (user/repo/type/branch/path)', () => {
        let githubUrl = new GithubURL("http://github.my.com/"+USERNAME+"/"+REPOSITORY+"/"+FileType.BLOB+"/"+BRANCH+"/"+FILE_PATH);

        expect(USERNAME).to.equal(githubUrl.user);
        expect(REPOSITORY).to.equal(githubUrl.repository);
        expect(FileType.BLOB).to.equal(githubUrl.fileType);
        expect(BRANCH).to.equal(githubUrl.branch);
        expect(FILE_PATH).to.equal(githubUrl.filePath);
    });

});