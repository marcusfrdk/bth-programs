![Banner](./assets/banner.webp)

# BTH Programs

![top language](https://img.shields.io/github/languages/top/marcusfrdk/bth-programs)
![code size](https://img.shields.io/github/languages/code-size/marcusfrdk/bth-programs)
![last commit](https://img.shields.io/github/last-commit/marcusfrdk/bth-programs)
![issues](https://img.shields.io/github/issues/marcusfrdk/bth-programs)
![contributors](https://img.shields.io/github/contributors/marcusfrdk/bth-programs)

A web-application to get an overview of all programs at Blekinge Institute of Technology. The app allows a user to see more detailed data faster than official sources.

The app is in **Swedish** since this is the targeted user-base. If anyone would like the app to be internationalized, please let me know or open an issue and the feature will be added.

_Note: Some programs will not be included in the program due to errors in generation or because the endpoint used during generation is private._

## Requirements

You need at least Python `3.10` or greater, as well as NPM `16` or greater to develop `bth-programs`.

## Development

To get started developing the site, run the following commands:

```bash
git clone https://github.com/marcusfrdk/bth-programs
cd bth-programs
npm install
pip install -r requirements.txt
```

Once all dependencies are installed, you can either choose to use the already generated data, or re-generate the data. To re-generate, run the following command:

```bash
python scripts/generate.py
```

Note that this process will take between 5-15 minutes depending on the number of cores your processor has.

Once everything is setup, run the following command to start the development server:

```bash
npm run dev
```

## Deployment

Deployment is done automatically via the [Vercel integration](https://vercel.com) by pushing code to the `main` branch. _This branch is protected_ and cannot be pushed to. Please create a new branch or fork this repository and create a pull request in order to merge your code.

