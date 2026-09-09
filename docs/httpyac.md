# Using the Cinelog API with httpYac

These notes are for [docs/api_documentation.http](api_documentation.http). Auth uses an `auth_token` cookie, not a Bearer token.

## 1. Install the extension

In Cursor or VS Code, open Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`) and install **httpYac - Rest Client** (`anweber.vscode-httpyac`).

## 2. Run the app

From the project root:

```bash
npm run dev
```

The default host is `http://localhost:3000`.

## 3. Add your credentials

Create `docs/http-client.private.env.json` (gitignored) with:

```json
{
  "dev": {
    "username": "demo_user",
    "email": "demo@example.com",
    "password": "ChangeMe1@",
    "displayName": "Demo"
  }
}
```

Password rules: 6–20 characters, upper + lower + number, and one of `@ # & ! _`. Username is 3–10 characters (letters, numbers, underscore).

Do not commit real passwords.

## 4. Open the requests file

Open `docs/api_documentation.http`.

Select the **dev** environment (status bar, or Command Palette → “httpYac: Toggle Environment”).

## 5. Send requests

Click **Send** above a `###` block, or put the cursor on the request and run **httpYac: Send Request**.

1. Send **Login** (or **Signup** once). httpYac stores the cookie.
2. Send any other request. Protected routes (`/me`, library, POST/PATCH/DELETE) need that cookie.
3. **Search movies (anonymous)** skips the cookie jar so you can compare logged-out vs logged-in search.

If a protected call returns 401, send Login again.
