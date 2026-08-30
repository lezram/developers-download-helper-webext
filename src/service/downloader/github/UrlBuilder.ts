export class UrlBuilder {
    private link: URL;

    constructor(url: URL | string) {
        this.link = new URL(url instanceof URL ? url.href : url);
    }

    public removePath(): UrlBuilder {
        this.link.pathname = "/";
        return this;
    }

    public slash(name: string): UrlBuilder {

        let pathName = (name || "").replace(/^[/]+/g, "").replace(/[/]+$/g, "");

        if (this.link.pathname !== '/') {
            pathName = "/"+pathName;
        }

        this.link.pathname += pathName;

        return this;
    }

    public addSubdomain(subdomain: string): UrlBuilder {
        this.link.hostname = subdomain + "." + this.link.hostname;
        return this;
    }

    public addQuery(key: string, value: string) {
        if (!this.link.search && this.link.search.length <= 0) {
            this.link.search = "?";
        }
        else {
            this.link.search += "&";
        }
        this.link.search += key + "=" + value;

        return this;
    }

    public build(): string {
        return this.link.href;
    }
}
