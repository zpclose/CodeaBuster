import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/admin-panel/',
                '/manage-',
                '/settings/account',
                '/profile',
            ],
        },
        sitemap: 'https://www.codebustersconnect.com/sitemap.xml',
    };
}
