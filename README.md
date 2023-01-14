# Nest OAuth: Configuration and Operations

## Intro

This is the source code for the tutorial [Nest OAuth](https://dev.to/rodrigogs/nest-oauth-4j4e).
This is the 1<sup>st</sup> part on a 5 part series, where we will build a production level NestJS OAuth2 service.

### Contents

This contains only the code for the services and can be adapter for any kind of API.

## Local Setup

1. Install the dependencies:
    ```bash
    $ yarn install
    ```
2. Create a .env file with all the fields equal to the [example](.env.example).
3. Run the app in development mode:
    ```bash
    $ yarn start:dev
    ```

## Unit Testing

**All tests:**

```bash
$ yarn run test
```

**Individual test:**

```bash
$ yarn run test service-name.service.spec.ts
 ```

**Coverage:**

```bash
$ yarn run test:cov
```

## License

The code of this tutorial is licensed under the GNU GPLv3 - see the [LICENSE](LICENSE) file for details.