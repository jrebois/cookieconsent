import * as CookieConsent from "../src/index"
import testConfig from "./config/full-config";
import basicConfig from "./config/basic-config";
import { setCookie } from "./config/mocks-utils";
import { globalObj } from '../src/core/global';

import {
    eraseCookiesHelper,
    getAllCookies,
    getCookieEraseDomains,
    getSingleCookie,
    parseCookie
}from '../src/utils/cookies';

/**
 * @type {import("../src/core/global").Api}
 */
let api;

describe("Cookie should be created successfully", () => {
    beforeAll(async () => {
        api = CookieConsent;
        await api.run(testConfig);
        api.acceptCategory('all');
    })

    it('Should retrieve the cookie with all the fields', () => {
        /**
         * @type {import("../src/core/global").CookieValue}
         */
        const ccCookie = parseCookie(getSingleCookie('cc_cookie', true));

        expect(ccCookie).toBeDefined();
        expect(ccCookie.data).toBeDefined();
        expect(typeof ccCookie.consentId).toBe('string');
        expect(ccCookie.consentTimestamp).toBeDefined();
        expect(ccCookie.lastConsentTimestamp).toBeDefined();
        expect(ccCookie.languageCode).toEqual('en');
        expect(ccCookie.categories).toEqual(['necessary', 'analytics', 'ads']);
        expect(ccCookie.services).toMatchObject({
            necessary: ['service1'],
            analytics: ['service1', 'service2'],
            ads: []
        });
    });

    it('Should erase cookies', () => {
        const name1 = 'test_cookie1';
        const name2 = 'test_cookie2';
        setCookie(name1, '{"ciao": 11}');
        setCookie(name2, '{"aloha": 22}');
        expect(getSingleCookie(name1)).toBeTruthy();
        expect(getSingleCookie(name2)).toBeTruthy();
        eraseCookiesHelper([name1, name2]);
        expect(getSingleCookie(name1)).toBeFalsy();
        expect(getSingleCookie(name2)).toBeFalsy();
    });

    it('Should set the cookie', () => {
        setCookie('test_cookie', '{"ciao": 21}');
        const cookieValue = parseCookie(getSingleCookie('test_cookie', true));
        expect(cookieValue.ciao).toBe(21);
        eraseCookiesHelper(['test_cookie']);
    })

    it('Should return all cookies', () => {
        const allCookies = getAllCookies();
        expect(allCookies.length).toBe(4);  // 3 service cookies + cc_cookie
    })

    it('Should return only the cookies that match the regex', () => {
        const allCookies = getAllCookies(/^service1Cookie/);
        expect(allCookies.length).toBe(2);
        expect(allCookies).toContain('service1Cookie1', 'service1Cookie2');
    })
})

describe('getCookieEraseDomains', () => {
    it('Should infer root domain variants when cookie.domain is not configured', () => {
        const domains = getCookieEraseDomains(undefined, 'www.example.com', '');

        expect(domains).toEqual(expect.arrayContaining([
            '',
            'www.example.com',
            '.www.example.com',
            'example.com',
            '.example.com',
        ]));
    });

    it('Should include root domain when hostname has multiple subdomains', () => {
        const hostname = 'app.blog.example.com';
        const domains = getCookieEraseDomains(undefined, hostname, '');

        expect(domains).toEqual(expect.arrayContaining([
            '',
            hostname,
            '.' + hostname,
            'example.com',
            '.example.com',
        ]));
    });

    it('Should not infer hostname variants when config cookie domain is set on a nested subdomain', () => {
        const hostname = 'app.blog.example.com';
        const domains = getCookieEraseDomains(undefined, hostname, 'app.blog.example.com');

        expect(domains).toEqual(['', 'app.blog.example.com']);
        expect(domains).not.toContain('example.com');
        expect(domains).not.toContain('.example.com');
    });

    it('Should return only the explicit domain when provided', () => {
        expect(getCookieEraseDomains('.example.com', 'www.example.com', '')).toEqual(['.example.com']);
    });

    it('Should not infer dotted domain variants for localhost', () => {
        const domains = getCookieEraseDomains(undefined, 'localhost', '');

        expect(domains.filter((domain) => domain.includes('.'))).toEqual([]);
    });

    it('Should use config cookie domain when specified', () => {
        const domains = getCookieEraseDomains(undefined, 'www.example.com', 'www.example.com');

        expect(domains).toEqual(expect.arrayContaining([
            '',
            'www.example.com',
            'example.com',
            '.example.com',
        ]));
        expect(domains).not.toContain('.www.example.com');
    });

    it('Should strip www prefix from config cookie domain', () => {
        const domains = getCookieEraseDomains(undefined, 'localhost', 'www.example.com');

        expect(domains).toEqual(expect.arrayContaining([
            'www.example.com',
            'example.com',
            '.example.com',
        ]));
    });

    it('Should infer root domain after init when cookie.domain is not configured', async () => {
        await CookieConsent.reset(true);
        await CookieConsent.run(basicConfig);

        expect(globalObj._config.cookie.domain).toBe('');

        const domains = getCookieEraseDomains(undefined, 'app.blog.example.com');

        expect(domains).toEqual(expect.arrayContaining([
            'example.com',
            '.example.com',
        ]));
    });
})

describe('eraseCookiesHelper domain variants', () => {
    afterEach(() => {
        document.cookie.split(';').forEach((cookie) => {
            const name = cookie.split('=')[0].trim();
            if (name)
                eraseCookiesHelper([name]);
        });
    });

    it('Should erase cookies set with a domain attribute', () => {
        const domain = location.hostname;
        document.cookie = `_ga=test; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/; domain=${domain}`;
        expect(document.cookie).toContain('_ga=');

        eraseCookiesHelper(['_ga']);
        expect(document.cookie).not.toContain('_ga=');
    });

    it('Should only use the explicit domain when provided', () => {
        const domain = location.hostname;
        document.cookie = `_ga=test; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/; domain=${domain}`;
        eraseCookiesHelper(['_ga'], '/', 'wrong.domain');
        expect(document.cookie).toContain('_ga=');

        eraseCookiesHelper(['_ga'], '/', domain);
        expect(document.cookie).not.toContain('_ga=');
    });
})
