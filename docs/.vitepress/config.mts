/**
 * The documentation site (phase D5, PD 10.3): the user guide of docs/user rendered with search and a sidebar,
 * published under <site>/guide/ beside the demo page, the API reference and the go-links, which keep their
 * addresses (.github/workflows/pages.yml copies docs/ as it is and adds the guide). The Markdown stays the source and
 * stays readable on GitHub; a link that leaves docs/user goes to the file on GitHub.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// types only: the config lives outside frontend/, whose node_modules hold VitePress
import type { DefaultTheme, UserConfig } from "vitepress";

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const USER = path.join(DOCS, "user");
const MODULES = path.join(DOCS, "..", "frontend", "node_modules");
const REPOSITORY = "https://github.com/jplenio/Plenio-Music-Production-System";

/** A page's title: its first heading. */
function titleOf(file: string): string {
  const heading = fs.readFileSync(file, "utf8").match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : path.basename(file, ".md");
}

/** The sidebar: the guide's folders in a fixed order, each page by its heading. */
function sidebar(): DefaultTheme.SidebarItem[] {
  const page = (rel: string) => ({
    text: titleOf(path.join(USER, rel)),
    link: `/${rel.replace(/(^|\/)README\.md$/, "$1").replace(/\.md$/, "")}`,
  });
  const folder = (dir: string, text: string): DefaultTheme.SidebarItem => ({
    text,
    collapsed: dir !== "paths",
    items: fs
      .readdirSync(path.join(USER, dir))
      .filter((f) => f.endsWith(".md"))
      .sort((a, b) =>
        a === "README.md" ? -1 : b === "README.md" ? 1 : a.localeCompare(b),
      )
      .map((f) => page(`${dir}/${f}`))
      // the templates by their number (1 · YuE2 · Song first), the rest as listed
      .sort((a, b) =>
        dir === "paths"
          ? a.text.localeCompare(b.text, "en", { numeric: true })
          : 0,
      ),
  });
  return [
    {
      text: "Start",
      items: [
        "getting-started.md",
        "models.md",
        "configuration.md",
        "recipes.md",
        "troubleshooting.md",
        "licensing.md",
      ].map(page),
    },
    folder("paths", "The templates"),
    folder("player", "The Plenio Player"),
    folder("concepts", "Concepts"),
  ];
}

const config: UserConfig<DefaultTheme.Config> = {
  title: "Plenio",
  description:
    "Songs in ComfyUI with YuE2 and MiniMax Music 3, and the Plenio Player",
  srcDir: "user",
  outDir: "../frontend/dist-site/guide",
  base: "/Plenio-Music-Production-System/guide/",
  cleanUrls: true,
  // the pages live in docs/, the toolchain in frontend/: their imports resolve there
  vite: {
    resolve: {
      alias: [
        { find: /^vue$/, replacement: path.join(MODULES, "vue") },
        {
          find: /^vue\/server-renderer$/,
          replacement: path.join(MODULES, "vue", "server-renderer"),
        },
      ],
    },
  },
  lastUpdated: false,
  rewrites: { "README.md": "index.md", ":dir/README.md": ":dir/index.md" },
  themeConfig: {
    nav: [
      { text: "Guide", link: "/" },
      {
        text: "Demo",
        link: "https://jplenio.github.io/Plenio-Music-Production-System/",
      },
      {
        text: "Song API",
        link: "https://jplenio.github.io/Plenio-Music-Production-System/api/",
      },
    ],
    sidebar: sidebar(),
    search: { provider: "local" },
    socialLinks: [{ icon: "github", link: REPOSITORY }],
    editLink: { pattern: `${REPOSITORY}/edit/main/docs/user/:path` },
  },
  markdown: {
    config(md) {
      // inline code is text, never a Vue expression: `{{` in the guide stays two braces
      const code = md.renderer.rules.code_inline;
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) =>
        (code
          ? code(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options)
        ).replace(/^<code/, "<code v-pre");
      // a relative link that leaves docs/user (the API guide, the developer docs, the README) goes to GitHub
      const open = md.renderer.rules.link_open;
      md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const href = tokens[idx].attrGet("href") ?? "";
        if (href && !/^[a-z][a-z0-9+.-]*:|^#|^\//i.test(href)) {
          const from = path.dirname(
            path.join(
              USER,
              (env as { relativePath?: string }).relativePath ?? "",
            ),
          );
          const [file, hash] = href.split("#");
          const target = path.resolve(from, file);
          if (!target.startsWith(USER + path.sep)) {
            const rel = path
              .relative(path.dirname(DOCS), target)
              .split(path.sep)
              .join("/");
            tokens[idx].attrSet(
              "href",
              `${REPOSITORY}/blob/main/${rel}${hash ? `#${hash}` : ""}`,
            );
          }
        }
        return open
          ? open(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options);
      };
    },
  },
};

export default config;
