import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.codebustersconnect.com';
    const lastModified = new Date();

    return [
        { url: `${baseUrl}/`, lastModified, changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/programs`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/projects`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/members`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/network`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/events`, lastModified, changeFrequency: 'weekly', priority: 0.8 },

        { url: `${baseUrl}/register`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/login`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/idea-generator`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/submit-proposal`, lastModified, changeFrequency: 'monthly', priority: 0.7 },

        { url: `${baseUrl}/hok-portfolio`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/mlbb-portfolio`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/sifonix-portfolio`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/icsit-portfolio`, lastModified, changeFrequency: 'monthly', priority: 0.7 },

        { url: `${baseUrl}/management`, lastModified, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/maintenance`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    ];
}
