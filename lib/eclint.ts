///<reference path='../bower_components/dt-node/node.d.ts'/>
///<reference path='../node_modules/linez/linez.d.ts'/>
var editorconfig = require('editorconfig');
import events = require('events');
var extend = require('node.extend');
import fs = require('fs');
var globule = require('globule');
import linez = require('linez');

import IHashTable = require('interfaces/IHashTable');
import ILogger = require('interfaces/ILogger');
import IOptions = require('interfaces/IOptions');
import ISettings = require('interfaces/ISettings');
import Rule = require('rules/Rule');
import Setting = require('settings/Setting');
import SettingFactory = require('settings/SettingFactory');
import SettingProvider = require('settings/SettingProvider');
import util = require('util');


class ECLint extends events.EventEmitter implements ILogger {

	private settingFactory: SettingFactory;

	set newlines(newlines: string[]) {
		linez.configure({
			newlines: newlines
		});
	}

	constructor() {
		super();
		this.settingFactory = new SettingFactory(this);
	}

	check(patterns: string[], options?: IOptions) {
		this.forEachFileAndRule(patterns, options || {}, (doc, rule) => {
			rule.check(doc);
		});
	}

	private forEachFileAndRule(patterns: string[], options: any,
		callback: (doc: linez.Document, rule: Rule) => void) {

		this.forEachFile(patterns, options, (file, lines, rawSettings) => {
			this.forEachRule(rawSettings, rule => {
				callback(lines, rule);
			});
		});
	}

	private forEachFile(patterns: string[], options: any,
		callback: (file: string, doc: linez.Document, rawSettings: any) => void) {

		globule.find(patterns).forEach(file => {
			var fileSettings = editorconfig.parse(file);
			var rawSettings = extend(fileSettings, options.settings);
			var encoding = rawSettings.charset || 'utf8';
			fs.readFile(file, { encoding: encoding }, (err, contents) => {
				if (err) {
					this.error(err);
				}
				callback(file, linez.parse(contents), rawSettings);
			});
		});
	}

	private forEachRule(rawSettings: any, callback: (rule: Rule) => void) {
		var settings = this.settingFactory.createSettings(rawSettings);
		var settingProvider = new SettingProvider(rawSettings, settings);
		var rules = this.createUniqueRules(settingProvider, settings);
		rules.forEach(callback);
	}

	private createUniqueRules(settingProvider: SettingProvider,
		settings: IHashTable<Setting>): Rule[] {

		var alreadyRegistered: any = {};
		var rules = [];
		Object.keys(settings).forEach(key => {
			var setting = settings[key];
			var ruleClass = setting.ruleClass;
			if (typeof alreadyRegistered[ruleClass] === 'undefined') {
				alreadyRegistered[ruleClass] = true;
				rules.push(new ruleClass(settingProvider, this));
			}
		});
		return rules;
	}

	fix(patterns: string[], options?: IOptions) {
		this.forEachFile(patterns, options, (file, doc, rawSettings) => {
			this.forEachRule(rawSettings, rule => {
				doc = rule.fix(doc);
			});
			fs.writeFileSync(file, doc.toString(), {
				encoding: rawSettings.encoding || 'utf8'
			});
		});
	}

	infer(patterns: string[], options?: IOptions): ISettings {
		var inferred: ISettings = {};
		this.forEachFileAndRule(patterns, options || {}, (doc, rule) => {
			this.mergeSettings(inferred, rule.infer(doc));
		});
		return inferred;
	}

	private mergeSettings(s1: ISettings, s2: ISettings) {
		Object.keys(s2).forEach(key => {
			s1[key] = s1[key] || 0;
			s1[key] += s2[key];
		});
		return s1;
	}

	info(message: string) {
		this.emit('info', message);
	}

	debug(message: string) {
		this.emit('debug', message);
	}

	warn(message: string) {
		this.emit('warn', message);
	}

	error(err: Error) {
		this.emit('error', err);
	}

}

export = ECLint;
