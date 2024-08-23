# Nest OAuth: Adding External Providers

## Intro

This is the source code for the
tutorial [Nest Authentication with OAuth2.0](https://dev.to/tugascript/nestjs-authentication-with-oauth20-adding-external-providers-2kj).
This is the 6<sup>th</sup> and extra part on a 5 part series, where we will build a production level NestJS OAuth2
service.

### Contents

This contains the code for a fastify based REST Authentication API, with local and external OAuth2.0 authentication.

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

## Testing

**All Unit tests:**

```bash
$ yarn test
```

**Individual Unit test:**

```bash
$ yarn test service-name.service.spec.ts
 ```

**Coverage:**

```bash
$ yarn test:cov
```

**E2E tests:**

```bash
$ yarn test:e2e
```

## License

The code of this tutorial is licensed under the GNU Lesser General Public License v3.0. See the [Copying](COPYING)
and [Copying Lesser](COPYING.LESSER) files for details.