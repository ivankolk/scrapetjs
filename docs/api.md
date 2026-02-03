# API Reference

## Base URL

By default, the API is available at `http://localhost:3000`.

## Endpoints

### 1. Scrape Threads Post

Extracts data from a specific Threads post.

- **URL:** `/api/scrape`
- **Method:** `POST`
- **Content-Type:** `application/json`

#### Request Body

| Field            | Type    | Required | Default | Description                                                               |
| :--------------- | :------ | :------- | :------ | :------------------------------------------------------------------------ |
| `url`            | string  | Yes      | -       | The full URL of the Threads post (e.g., `https://www.threads.net/t/...`). |
| `includeReplies` | boolean | No       | `true`  | Whether to include replies in the response.                               |
| `maxReplies`     | number  | No       | `all`   | Maximum number of replies to return.                                      |
| `timeout`        | number  | No       | `30000` | Operation timeout in milliseconds (max 60000).                            |

#### Request Example

```json
{
	"url": "https://www.threads.net/t/C8H5FiCtESk/",
	"includeReplies": true,
	"maxReplies": 10
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "thread": {
      "id": "33887...",
      "code": "C8H5...",
      "text": "Post content...",
      "author": {
        "username": "user",
        "verified": true,
        "profilePicture": "..."
      },
      "stats": {
        "likes": 120,
        "replies": 10
      },
      "publishedAt": 1718...,
      "url": "https://threads.net/..."
    },
    "replies": [ ... ],
    "metadata": {
      "scrapedAt": "2024-05-20T10:00:00Z",
      "url": "...",
      "replyCount": 10,
      "processingTime": 1500
    }
  }
}
```

#### Error Response

```json
{
	"success": false,
	"error": {
		"code": "INVALID_URL",
		"message": "Invalid Threads URL format",
		"details": null
	}
}
```

### 2. Health Check

Checks if the service is running.

- **URL:** `/api/health`
- **Method:** `GET`

#### Response

```json
{
	"status": "ok"
}
```

## Error Codes

| Code              | Status | Description                                                |
| :---------------- | :----- | :--------------------------------------------------------- |
| `INVALID_URL`     | 400    | The provided URL is not a valid Threads post URL.          |
| `INVALID_REQUEST` | 400    | The request body validation failed (e.g., missing fields). |
| `DATA_NOT_FOUND`  | 404    | The post could not be found, is private, or deleted.       |
| `TIMEOUT`         | 504    | The scraping operation timed out.                          |
| `RATE_LIMITED`    | 429    | Too many requests.                                         |
| `BROWSER_ERROR`   | 500    | Failed to launch or control the browser.                   |
| `PARSE_ERROR`     | 500    | Failed to parse the page content structure.                |
| `INTERNAL_ERROR`  | 500    | An unexpected server error occurred.                       |
