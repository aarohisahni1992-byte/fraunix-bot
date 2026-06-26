const { Collection } = require('discord.js');

const MENTION_PREFIX = 'mention';

const ALIASES = {
  ui: 'userinfo',
  si: 'serverinfo',
  cf: 'coinflip'
};
const RESOLVE_TIMEOUT = 5000;

class PrefixContext {
  constructor(message, client, commandName, args, prefixUsed) {
    this.message = message;
    this.client = client;
    this.commandName = commandName;
    this.args = args;
    this.prefixUsed = prefixUsed;

    this._deferred = false;
    this._replied = false;
    this._ephemeral = false;
    this._replyContent = null;

    this.id = 'prefix_' + message.id;
    this.user = message.author;
    this.member = message.member;
    this.guild = message.guild;
    this.channel = message.channel;
    this.createdTimestamp = message.createdTimestamp;
  }

  get options() {
    const ctx = this;
    return {
      _args: this.args,
      _command: this._command,

      getString(name) {
        const opt = ctx._findOption(name);
        if (!opt) return null;
        const val = ctx._consumeArgs(opt, 'string');
        return val;
      },

      getMember(name) {
        const opt = ctx._findOption(name);
        if (!opt) return null;
        const val = ctx._consumeArgs(opt, 'member');
        if (!val) return null;
        return ctx.guild.members.cache.get(val) || null;
      },

      getUser(name) {
        const opt = ctx._findOption(name);
        if (!opt) return null;
        const val = ctx._consumeArgs(opt, 'user');
        if (!val) return null;
        return ctx.client.users.cache.get(val) || null;
      },

      getInteger(name) {
        const opt = ctx._findOption(name);
        if (!opt) return null;
        const val = ctx._consumeArgs(opt, 'integer');
        return val;
      },

      getBoolean(name) {
        const opt = ctx._findOption(name);
        if (!opt) return null;
        const val = ctx._consumeArgs(opt, 'boolean');
        return val;
      },

      getChannel(name) {
        const opt = ctx._findOption(name);
        if (!opt) return null;
        const val = ctx._consumeArgs(opt, 'channel');
        if (!val) return null;
        return ctx.guild.channels.cache.get(val) || null;
      },

      getRole(name) {
        const opt = ctx._findOption(name);
        if (!opt) return null;
        const val = ctx._consumeArgs(opt, 'role');
        if (!val) return null;
        return ctx.guild.roles.cache.get(val) || null;
      },

      getSubcommand() {
        return ctx._subcommand || null;
      }
    };
  }

  async deferReply(opts = {}) {
    this._deferred = true;
    this._ephemeral = opts.ephemeral || false;
    await this.channel.sendTyping();
  }

  async editReply(content) {
    if (this._replyMessage) {
      return this._replyMessage.edit(content);
    }
    this._replyMessage = await this.channel.send(content);
    return this._replyMessage;
  }

  async reply(content) {
    this._replied = true;
    if (this._replyMessage) {
      return this._replyMessage.edit(content);
    }
    this._replyMessage = await this.channel.send(content);
    return this._replyMessage;
  }

  async followUp(content) {
    return this.channel.send(content);
  }

  _findOption(name) {
    if (!this._command) return null;
    for (const opt of this._command.options || []) {
      if (opt.name === name) return opt;
      if (opt.options) {
        for (const sub of opt.options) {
          if (sub.name === name) return sub;
        }
      }
    }
    return null;
  }

  _consumeArgs(opt, type) {
    if (!opt) return null;
    const isSub = opt.type === 1;

    if (type === 'string') {
      if (isSub) return null;
      if (this._parsedArgs && this._parsedArgs[opt.name] !== undefined) {
        return this._parsedArgs[opt.name];
      }
      if (this.args.length > 0) {
        return this.args.splice(0, this.args.length).join(' ');
      }
      return null;
    }

    if (this._parsedArgs && this._parsedArgs[opt.name] !== undefined) {
      return this._parsedArgs[opt.name];
    }

    if (this.args.length === 0) return null;
    const raw = this.args[0];
    this.args.splice(0, 1);

    switch (type) {
      case 'member':
      case 'user':
        const userId = this._resolveUser(raw);
        return userId || null;
      case 'channel':
        return this._resolveChannel(raw);
      case 'role':
        return this._resolveRole(raw);
      case 'integer':
        const num = parseInt(raw);
        return isNaN(num) ? null : num;
      case 'boolean':
        if (['true', 'yes', 'y', '1'].includes(raw.toLowerCase())) return true;
        if (['false', 'no', 'n', '0'].includes(raw.toLowerCase())) return false;
        return null;
      default:
        return raw;
    }
  }

  _resolveUser(text) {
    const match = text.match(/^<@!?(\d+)>$/);
    if (match) return match[1];
    if (/^\d{17,20}$/.test(text)) return text;
    return null;
  }

  _resolveChannel(text) {
    const match = text.match(/^<#(\d+)>$/);
    if (match) return match[1];
    if (/^\d{17,20}$/.test(text)) return text;
    return null;
  }

  _resolveRole(text) {
    const match = text.match(/^<@&(\d+)>$/);
    if (match) return match[1];
    if (/^\d{17,20}$/.test(text)) return text;
    return null;
  }

  async init() {
    this._command = this.client.commands.get(this.commandName);
    if (!this._command) return false;

    const rawOptions = this._command.data?.options?.toJSON?.() || this._command.data?.options || [];

    const subcommands = rawOptions.filter(o => o.type === 1);
    if (subcommands.length > 0) {
      const subName = this.args[0]?.toLowerCase();
      const sub = subcommands.find(s => s.name === subName);
      if (sub) {
        this._subcommand = subName;
        this.args.splice(0, 1);
        this._parsedArgs = {};
        for (const subOpt of sub.options || []) {
          this._parsedArgs[subOpt.name] = null;
        }
        return true;
      }
    }

    this._parsedArgs = {};
    for (const opt of rawOptions) {
      if (opt.type !== 1) {
        this._parsedArgs[opt.name] = null;
      }
    }
    return true;
  }
}

async function handlePrefixMessage(message, client) {
  const config = require('../../config.json');
  const prefix = config.prefix || '!';
  let content = message.content;
  let prefixUsed = null;

  if (content.startsWith(prefix)) {
    prefixUsed = prefix;
    content = content.slice(prefix.length);
  } else {
    const mention = `<@${client.user.id}>`;
    const mentionNick = `<@!${client.user.id}>`;
    if (content.startsWith(mention)) {
      prefixUsed = MENTION_PREFIX;
      content = content.slice(mention.length);
    } else if (content.startsWith(mentionNick)) {
      prefixUsed = MENTION_PREFIX;
      content = content.slice(mentionNick.length);
    }
  }

  if (!prefixUsed) return false;

  content = content.trim();
  if (!content) {
    if (prefixUsed === MENTION_PREFIX) {
      await message.channel.send(`My prefix is \`${prefix}\`. Use \`${prefix}help\` or \`/help\` to see commands.`);
      return true;
    }
    return false;
  }

  const args = content.split(/ +/);
  let commandName = args.shift().toLowerCase();

  let command = client.commands.get(commandName);
  if (!command && ALIASES[commandName]) {
    command = client.commands.get(ALIASES[commandName]);
  }
  if (!command) return false;
  commandName = command.data.name;

  const requiredPerms = command.data.default_member_permissions;
  if (requiredPerms) {
    const isOwner = config.owners.includes(message.author.id);
    if (!isOwner && !message.member.permissions.has(requiredPerms)) {
      const permBit = new (require('discord.js').PermissionsBitField)(requiredPerms);
      const permNames = permBit.toArray().map(p =>
        p.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
      ).join(', ');
      await message.channel.send(`${config.emojis.error} You need **${permNames}** permission to use \`${commandName}\`.`);
      return true;
    }
  }

  const ctx = new PrefixContext(message, client, commandName, args, prefixUsed);
  const initialized = await ctx.init();
  if (!initialized) return false;

  try {
    await command.execute(ctx, client);
  } catch (error) {
    console.error(`[PREFIX ERROR] ${commandName}:`, error.message);
    const errMsg = `${config.emojis.error} An error occurred: ${error.message}`;
    if (ctx._replyMessage) {
      await ctx._replyMessage.edit(errMsg).catch(() => {});
    } else {
      await message.channel.send(errMsg).catch(() => {});
    }
  }
  return true;
}

module.exports = { PrefixContext, handlePrefixMessage, MENTION_PREFIX };
