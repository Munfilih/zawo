export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  videoId: string;
  category?: string;
}



export enum AppView {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}