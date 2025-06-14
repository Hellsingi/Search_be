import axios from 'axios';
import { Posting } from '../models/posting.model';

export class CompanyPostingRepository {
    private readonly apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    async getPostings(): Promise<Posting[]> {
        try {
            const response = await axios.get<Posting[]>(this.apiUrl);
            return response.data;
        } catch (error) {
            console.error('Error fetching postings from API:', error);
            throw new Error('Failed to fetch postings from API');
        }
    }

    async createPosting(posting: Omit<Posting, 'id'>): Promise<Posting> {
        try {
            const response = await axios.post<Posting>(this.apiUrl, posting);
            return response.data;
        } catch (error) {
            console.error('Error creating posting:', error);
            throw new Error('Failed to create posting');
        }
    }
}