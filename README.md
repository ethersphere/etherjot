# Etherjot

Focus on writing and publish to Swarm with ease.

## Overview

Etherjot enables you to effortlessly create a blog on Swarm. It takes care of the publishing process and layout, allowing you to focus on writing. You can easily add article pages and menu pages one at a time. If you have a markdown file ready to be published, simply use a straightforward command, and it will be accessible on your website.

## Requirements

-   NodeJS version 16 or above
-   A running instance of [Bee](https://github.com/ethersphere/bee)
-   A usable [postage batch](https://docs.ethswarm.org/docs/access-the-swarm/keep-your-data-alive)

## Creating your front page

To create your homepage, simply execute `npx etherjot`.

The address you obtain is based on a [Swarm feed](https://docs.ethswarm.org/docs/dapps-on-swarm/feeds), ensuring that the address remains constant while always displaying the latest version of your blog. Share this address with your audience to provide them with continuous access to your most recent updates.

## Commands

Manage your articles and menu pages using two essential commands:

`npx etherjot add <path-to-markdown-file>`

`npx etherjot remove`
