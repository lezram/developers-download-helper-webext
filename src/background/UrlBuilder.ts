export class UrlBuilder {
    private link: HTMLAnchorElement;

    constructor(url: HTMLAnchorElement|string) {
        let element: HTMLAnchorElement;
        if (url instanceof HTMLAnchorElement) {
            element = <HTMLAnchorElement> url.cloneNode();
        }
        else {
            element = <HTMLAnchorElement> document.createElement('a');
            element.href = url;
        }

        this.link = element;
    }

    public removePath(): UrlBuilder {
        this.link.pathname = "/";
        return this;
    }

    public slash(name: string): UrlBuilder {

        let replacer = "/$1";
        if (this.link.pathname === '/') {
            replacer = "$1";
        }
        this.link.pathname += (name || "").replace(/^[/]*([^/]+)[/]*$/g, replacer);

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