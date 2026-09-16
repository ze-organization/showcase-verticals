import type { ComponentType } from "react";
import {
  BlueskyIcon,
  DiscordIcon,
  FacebookIcon,
  FlickrIcon,
  InstagramIcon,
  LinkedinIcon,
  PinterestIcon,
  SnapchatIcon,
  ThreadsIcon,
  TikTokIcon,
  TumblrIcon,
  TwitterIcon,
  WeChatIcon,
  YoutubeIcon,
} from "./social";

const DOMAIN_TO_ICON: Record<string, ComponentType> = {
  "facebook.com": FacebookIcon,
  "fb.com": FacebookIcon,
  "fb.me": FacebookIcon,
  "twitter.com": TwitterIcon,
  "x.com": TwitterIcon,
  "t.co": TwitterIcon,
  "instagram.com": InstagramIcon,
  "instagr.am": InstagramIcon,
  "youtube.com": YoutubeIcon,
  "youtu.be": YoutubeIcon,
  "linkedin.com": LinkedinIcon,
  "lnkd.in": LinkedinIcon,
  "tiktok.com": TikTokIcon,
  "vm.tiktok.com": TikTokIcon,
  "pinterest.com": PinterestIcon,
  "pin.it": PinterestIcon,
  "threads.net": ThreadsIcon,
  "threads.com": ThreadsIcon,
  "weixin.qq.com": WeChatIcon,
  "wechat.com": WeChatIcon,
  "snapchat.com": SnapchatIcon,
  "bsky.app": BlueskyIcon,
  "tumblr.com": TumblrIcon,
  "discord.com": DiscordIcon,
  "discord.gg": DiscordIcon,
  "flickr.com": FlickrIcon,
  "flic.kr": FlickrIcon,
};

/**
 * Resolves a social-platform icon from a link URL. Strips a leading
 * `www.` and matches the registered hosts above. Returns `undefined`
 * for unknown domains so callers can decide whether to render a
 * placeholder, a generic link glyph, or nothing.
 */
export function resolveSocialIcon(
  href: string | undefined,
): ComponentType | undefined {
  if (!href) return undefined;
  let host: string;
  try {
    host = new URL(href, "https://placeholder.invalid").hostname.toLowerCase();
  } catch {
    return undefined;
  }
  if (host.startsWith("www.")) host = host.slice(4);
  return DOMAIN_TO_ICON[host];
}
