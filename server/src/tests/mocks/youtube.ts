export const mockYouTubeResponse = {
  kind: 'youtube#searchListResponse',
  items: [
    {
      id: {
        kind: 'youtube#video',
        videoId: 'test123',
      },
      snippet: {
        title: 'Test Song Karaoke Version',
        description: 'Karaoke version of Test Song',
        thumbnails: {
          default: {
            url: 'https://example.com/thumbnail1.jpg',
          },
        },
      },
    },
    {
      id: {
        kind: 'youtube#video',
        videoId: 'test456',
      },
      snippet: {
        title: 'Another Test Song Karaoke',
        description: 'Karaoke version of Another Test Song',
        thumbnails: {
          default: {
            url: 'https://example.com/thumbnail2.jpg',
          },
        },
      },
    },
  ],
  pageInfo: {
    totalResults: 2,
    resultsPerPage: 2,
  },
}; 