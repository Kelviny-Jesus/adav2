# Ada

Welcome to Ada, the official open source version of Ada, which allows you to choose the LLM that you use for each prompt! Currently, you can use OpenAI, Anthropic, Ollama, OpenRouter, Gemini, LMStudio, Mistral, xAI, HuggingFace, DeepSeek, or Groq models - and it is easily extended to use any other model supported by the Vercel AI SDK! See the instructions below for running this locally and extending it to include more models.

This version includes enhanced authentication features, a modernized UI with Ada's visual identity, and improved provider management. The updated interface provides a seamless experience with gradient backgrounds, improved form elements, and consistent styling across all pages.

## Project management

Ada is a community effort! Still, the core team of contributors aims at organizing the project in way that allows
you to understand where the current areas of focus are.

If you want to know what we are working on, what we are planning to work on, or if you want to contribute to the
project, please check the [project management guide](./PROJECT.md) to get started easily.

## Requested Additions

- ✅ OpenRouter Integration (@coleam00)
- ✅ Gemini Integration (@jonathands)
- ✅ Autogenerate Ollama models from what is downloaded (@yunatamos)
- ✅ Filter models by provider (@jasonm23)
- ✅ Download project as ZIP (@fabwaseem)
- ✅ Improvements to the main Ada.new prompt in `app\lib\.server\llm\prompts.ts` (@kofi-bhr)
- ✅ DeepSeek API Integration (@zenith110)
- ✅ Mistral API Integration (@ArulGandhi)
- ✅ "Open AI Like" API Integration (@ZerxZ)
- ✅ Ability to sync files (one way sync) to local folder (@muzafferkadir)
- ✅ Containerize the application with Docker for easy installation (@aaronAdaon)
- ✅ Publish projects directly to GitHub (@goncaloalves)
- ✅ Ability to enter API keys in the UI (@ali00209)
- ✅ xAI Grok Beta Integration (@milutinke)
- ✅ LM Studio Integration (@karrot0)
- ✅ HuggingFace Integration (@ahsan3219)
- ✅ Ada terminal to see the output of LLM run commands (@thecodacus)
- ✅ Streaming of code output (@thecodacus)
- ✅ Ability to revert code to earlier version (@wonderwhy-er)
- ✅ Chat history backup and restore functionality (@sidbetatester)
- ✅ Cohere Integration (@hasanraiyan)
- ✅ Dynamic model max token length (@hasanraiyan)
- ✅ Better prompt enhancing (@SujalXplores)
- ✅ Prompt caching (@SujalXplores)
- ✅ Load local projects into the app (@wonderwhy-er)
- ✅ Together Integration (@mouimet-infinisoft)
- ✅ Mobile friendly (@qwikode)
- ✅ Better prompt enhancing (@SujalXplores)
- ✅ Attach images to prompts (@atrokhym)(@stijnus)
- ✅ Added Git Clone button (@thecodacus)
- ✅ Git Import from url (@thecodacus)
- ✅ PromptLibrary to have different variations of prompts for different use cases (@thecodacus)
- ✅ Detect package.json and commands to auto install & run preview for folder and git import (@wonderwhy-er)
- ✅ Selection tool to target changes visually (@emcconnell)
- ✅ Detect terminal Errors and ask Ada to fix it (@thecodacus)
- ✅ Detect preview Errors and ask Ada to fix it (@wonderwhy-er)
- ✅ Add Starter Template Options (@thecodacus)
- ✅ Perplexity Integration (@meetpateltech)
- ✅ AWS Bedrock Integration (@kunjabijukchhe)
- ✅ Add a "Diff View" to see the changes (@toddyclipsgg)
- ⬜ **HIGH PRIORITY** - Prevent Ada from rewriting files as often (file locking and diffs)
- ⬜ **HIGH PRIORITY** - Better prompting for smaller LLMs (code window sometimes doesn't start)
- ⬜ **HIGH PRIORITY** - Run agents in the backend as opposed to a single model call
- ⬜ Deploy directly to Vercel/Netlify/other similar platforms
- ⬜ Have LLM plan the project in a MD file for better results/transparency
- ⬜ VSCode Integration with git-like confirmations
- ⬜ Upload documents for knowledge - UI design templates, a code base to reference coding style, etc.
- ⬜ Voice prompting
- ⬜ Azure Open AI API Integration
- ⬜ Vertex AI Integration
- ⬜ Granite Integration
- ✅ Popout Window for Web Container(@stijnus)
- ✅ Ability to change Popout window size (@stijnus)

## Features

- **AI-powered full-stack web development** for **NodeJS based applications** directly in your browser.
- **Support for multiple LLMs** with an extensible architecture to integrate additional models.
- **Modern authentication system** with role-based access control for admin features.
- **Beautiful UI with Ada's visual identity** featuring gradient backgrounds and consistent styling.
- **Cloud and Local Provider management** for connecting to various AI services.
- **Attach images to prompts** for better contextual understanding.
- **Integrated terminal** to view output of LLM-run commands.
- **Revert code to earlier versions** for easier debugging and quicker changes.
- **Download projects as ZIP** for easy portability.
- **Integration-ready Docker support** for a hassle-free setup.

## Setup

If you're new to installing software from GitHub, don't worry! If you encounter any issues, feel free to submit an "issue" using the provided links or improve this documentation by forking the repository, editing the instructions, and submitting a pull request. The following instruction will help you get the stable branch up and running on your local machine in no time.

Let's get you up and running with the stable version of Ada!

## Prerequisites

Before you begin, you'll need to install two important pieces of software:

### Install Node.js

Node.js is required to run the application.

1. Visit the [Node.js Download Page](https://nodejs.org/en/download/)
2. Download the "LTS" (Long Term Support) version for your operating system
3. Run the installer, accepting the default settings
4. Verify Node.js is properly installed:
   - **For Windows Users**:
     1. Press `Windows + R`
     2. Type "sysdm.cpl" and press Enter
     3. Go to "Advanced" tab → "Environment Variables"
     4. Check if `Node.js` appears in the "Path" variable
   - **For Mac/Linux Users**:
     1. Open Terminal
     2. Type this command:
        ```bash
        echo $PATH
        ```
     3. Look for `/usr/local/bin` in the output

## Running the Application

You have two options for running Ada: directly on your machine or using Docker. The application now includes authentication features, so you'll be able to create an account, log in, and access admin features if you have the appropriate role.

### Option 1: Direct Installation (Recommended for Beginners)

1. **Install Package Manager (pnpm)**:

   ```bash
   npm install -g pnpm
   ```

2. **Install Project Dependencies**:

   ```bash
   pnpm install
   ```

3. **Start the Application**:

   ```bash
   pnpm run dev
   ```
   
### Option 2: Using Docker

This option requires some familiarity with Docker but provides a more isolated environment.

#### Additional Prerequisite

- Install Docker: [Download Docker](https://www.docker.com/)

#### Steps:

1. **Build the Docker Image**:

   ```bash
   # Using npm script:
   npm run dockerbuild

   # OR using direct Docker command:
   docker build . --target Ada-ai-development
   ```

2. **Run the Container**:
   ```bash
   docker compose --profile development up
   ```

## Configuring API Keys and Providers

### Adding Your API Keys

Setting up your API keys in Ada is straightforward:

1. Open the home page (main interface)
2. Select your desired provider from the dropdown menu
3. Click the pencil (edit) icon
4. Enter your API key in the secure input field

For admin users, additional configuration options are available in the Control Panel, accessible through the settings menu. Admin users can toggle between User Mode and Developer Mode to access advanced features.

![API Key Configuration Interface](./docs/images/api-key-ui-section.png)

### Configuring Custom Base URLs

For providers that support custom base URLs (such as Ollama or LM Studio), follow these steps:

1. Click the settings icon in the sidebar to open the settings menu
   ![Settings Button Location](./docs/images/Ada-settings-button.png)

2. Navigate to the "Providers" tab
3. Search for your provider using the search bar
4. Enter your custom base URL in the designated field
   ![Provider Base URL Configuration](./docs/images/provider-base-url.png)

The Control Panel now features dedicated tabs for Cloud Providers and Local Providers, making it easier to manage your connections to different AI services.

> **Note**: Custom base URLs are particularly useful when running local instances of AI models or using custom API endpoints.

### Supported Providers

- Ollama
- LM Studio
- OpenAILike

## Authentication System

The new authentication system provides:

1. **User Registration**: Create an account with your name, email, and password
2. **Login**: Secure authentication with your credentials
3. **Role-Based Access**: Admin users have access to additional features
4. **Message Limits**: Non-registered users have limited access to the system
5. **Password Recovery**: Reset your password if you forget it

All authentication pages feature Ada's modern visual identity with gradient backgrounds, subtle animations, and consistent styling.

## Setup Using Git (For Developers only)

This method is recommended for developers who want to:

- Contribute to the project
- Stay updated with the latest changes
- Switch between different versions
- Create custom modifications

#### Prerequisites

1. Install Git: [Download Git](https://git-scm.com/downloads)

#### Initial Setup

1. **Clone the Repository**:

   ```bash
   # Using HTTPS
   git clone https://github.com/Kelviny-Jesus/adav2
   ```

2. **Navigate to Project Directory**:

   ```bash
   cd Ada.diy
   ```

3. **Switch to the Main Branch**:
   ```bash
   git checkout main
   ```
4. **Install Dependencies**:

   ```bash
   pnpm install
   ```

5. **Start the Development Server**:
   ```bash
   pnpm run dev
   ```

#### Staying Updated

To get the latest changes from the repository:

1. **Save Your Local Changes** (if any):

   ```bash
   git stash
   ```

2. **Pull Latest Updates**:

   ```bash
   git pull origin main
   ```

3. **Update Dependencies**:

   ```bash
   pnpm install
   ```

4. **Restore Your Local Changes** (if any):
   ```bash
   git stash pop
   ```

#### Troubleshooting Git Setup

If you encounter issues:

1. **Clean Installation**:

   ```bash
   # Remove node modules and lock files
   rm -rf node_modules pnpm-lock.yaml

   # Clear pnpm cache
   pnpm store prune

   # Reinstall dependencies
   pnpm install
   ```

2. **Reset Local Changes**:
   ```bash
   # Discard all local changes
   git reset --hard origin/main
   ```

Remember to always commit your local changes or stash them before pulling updates to avoid conflicts.

---

## Available Scripts

- **`pnpm run dev`**: Starts the development server.
- **`pnpm run build`**: Builds the project.
- **`pnpm run start`**: Runs the built application locally using Wrangler Pages.
- **`pnpm run preview`**: Builds and runs the production build locally.
- **`pnpm test`**: Runs the test suite using Vitest.
- **`pnpm run typecheck`**: Runs TypeScript type checking.
- **`pnpm run typegen`**: Generates TypeScript types using Wrangler.
- **`pnpm run deploy`**: Deploys the project to Cloudflare Pages.
- **`pnpm run lint:fix`**: Automatically fixes linting issues.

---

## Contributing

We welcome contributions! Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

---

## Roadmap

Explore upcoming features and priorities on our [Roadmap](https://roadmap.sh/r/ottodev-roadmap-2ovzo).

---

## FAQ

For answers to common questions, issues, and to see a list of recommended models, visit our [FAQ Page](FAQ.md).
