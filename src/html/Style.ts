export const STYLE = `
body {
    max-width: 800px;
    padding: 32px;
    margin: 0 auto;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
        'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #eee;
}
header {
    padding: 32px;
    background-color: #fff;
    margin-bottom: 1px;
    text-align: center;
}
main {
    padding: 32px;
    background-color: #fff;
}
footer {
    margin-top: 1px;
    padding: 32px;
    background-color: #222;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #ff7a00;
}
nav {
    display: flex;
    flex-direction: row;
    column-gap: 8px;
    align-items: center;
    margin-bottom: 1px;
    padding: 32px;
    background-color: #fff;
}
footer svg {
    margin-right: 8px;
}
h1 {
    font-size: 32px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 64px;
}
h2 {
    border-left: 1px solid #000;
    padding-left: 16px;
    margin-top: 64px;
    margin-bottom: 32px;
}
p {
    margin: 0;
    padding: 0;
}
article p {
    margin-bottom: 32px;
}
a {
    text-decoration: none;
}
img {
    max-width: 100%;
}
code {
    display: inline-block;
    background: #ffd700;
    border: 1px solid #cdaf0d;
    padding: 2px 4px
}
pre {
    padding: 8px;
    background: #222;
    color: #fff;
    overflow-x: scroll;
}
pre code {
    background: none;
    border: none;
}
.post-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
}
.article-container {
    display: inline-block;
    width: 220px;
    margin-bottom: 32px;
    box-shadow: 2px 2px 8px #00000066;
}
.article-title {
    color: #000;
    font-size: 20px;
    font-weight: bold;
    text-decoration: none;
    margin-top: 8px;
    margin-bottom: 16px;
}
.article-body {
    padding: 8px;
}
.article-timestamp, .article-word-count {
    color: #222;
    font-size: 12px;
    margin-bottom: 8px;
}
.blog-name {
    font-size: 64px;
    font-weight: bold;
    display: inline;
    background-size: 100% 16px;
    background-image: linear-gradient(#ff8a00, #ff8a00);
    background-repeat: no-repeat;
    background-position: left 90%;
}
.nav-item {
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    background-color: #000;
    padding: 16px;
}
.tag {
    display: inline-block;
    background-color: #000;
    padding: 2px;
    padding-left: 8px;
    padding-right: 8px;
    margin-right: 8px;
    margin-bottom: 8px;
    font-size: 12px;
    color: #fff;
    text-decoration: none;
}
.tag:hover {
    background-color: #666;
}
`
