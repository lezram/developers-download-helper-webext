import * as jsdom from 'jsdom';

export default function domInit(){
    const JSDOM = jsdom["JSDOM"];
    const dom = new JSDOM(`<!doctype html><html><body></body></html>`);
    global['document'] = dom.window.document;
    global['window'] = dom.window;
    global['HTMLAnchorElement'] = dom.window.HTMLAnchorElement;
}


