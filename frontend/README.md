# Frontend - Web Application

## Documentation
Documentation can be viewed:
- `/docs` directory viewed as HTML pages generated by Typedoc (in production docs are served live at `/docs`).
- In-line JSDoc comments with TypeScript linting support.

## Startup
Create `.env` file with the following contents:
```
REACT_APP_API_URL="http://url.com/api"  # API URL or IP of backend server. Note that 
                                        # this should point to the backends api path
                                        
AMBER_DAYS=5                            # How many days before the suspense date 
                                        # is Amber

REACT_APP_API_VERSION="v1"              # API Version Number (Current: v1)

APP_PORT= "1234"                        # Port number to run the frontend server.
```

Run:

```shell
npm install
npm run build
npm run start
```

## Frontend NPM Commands
- `npm run dev` - Startup the frontend in developer mode (building is not necessary).
- `npm run build` - Build the frontend for deployment.
- `npm run start` - Start the frontend in production.
- `npm run docs` - Generate documentation using TypeDoc.

## Folder Structure
- `/build`  - The frontend build location.
- `/docs`   - The documentation directory.
- `/public` - Static file directory.
- `/src`    - Source code of the application.
  - `/components`     - All custom components used on the frontend.
  - `/config`         - Configuration files.
    - `language`      - Change the wording across the site.
    - `theme`         - Color pallette customizations and more.
  - `/pages`          - Page components organized by the menu structure.
  - `/util`           - Miscellaneous methods used across the frontend.
- `server.js`   - Production deployment server.
