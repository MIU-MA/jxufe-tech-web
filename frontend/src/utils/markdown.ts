import MarkdownIt from 'markdown-it';

/**
 * 安全的 markdown 渲染配置。
 *
 * 用于渲染不可信/半可信内容（管理员文章、AI 回复）并通过 v-html 插入 DOM。
 * 防御措施：
 *  1. html: false       -- 转义所有原始 HTML 标签，杜绝 <script>、<iframe> 等
 *  2. link 白名单协议    -- 仅允许 http/https/ftp/mailto，拦截 javascript:/data:/vbscript: 等
 *  3. 外链安全属性       -- 自动加 target="_blank" rel="noopener noreferrer nofollow"
 *  4. linkify           -- 自动识别裸 URL 为链接
 *
 * 即使某天有人把 html 改成 true，link 渲染器仍会过滤协议。
 */
const SAFE_PROTOCOLS = /^(https?:|ftp:|mailto:|tel:)/i;

export function createSafeMarkdown(): MarkdownIt {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true,
    typographer: false,
  });

  // 默认链接渲染
  const defaultLinkOpen =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  // 覆盖 link_open：校验协议 + 加安全属性
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex('href');
    if (hrefIndex >= 0) {
      const href: string = token.attrs[hrefIndex][1] || '';
      // 非白名单协议：移除 href，降级为纯文本样式
      if (href && !SAFE_PROTOCOLS.test(href) && !href.startsWith('#') && !href.startsWith('/')) {
        token.attrs[hrefIndex][1] = '#';
      }
    }
    // 外链加安全属性
    token.attrSet('target', '_blank');
    token.attrSet('rel', 'noopener noreferrer nofollow');
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  return md;
}
