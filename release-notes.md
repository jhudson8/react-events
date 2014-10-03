# Release Notes

## Development

[Commits](https://github.com/jhudson8/react-events/compare/v0.5.1...master)

## v0.5.1 - October 3rd, 2014
- $ to be provided for commonJS - aaa0faf

Compatibility notes:
- TODO : What might have broken?

[Commits](https://github.com/jhudson8/react-events/compare/v0.5.0...v0.5.1)

## v0.5.0 - September 7th, 2014
- add "react-component" keyword - 39f0ce1
- remove the "triggerWith" mixin and move the triggerWith method into the "events" mixin - b489c2f
- v0.4.3 - a694dac

[Commits](https://github.com/jhudson8/react-events/compare/v0.4.3...v0.5.0)

## v0.4.3 - July 25th, 2014
- fix ref event handlers in case the ref component changed during parent renders - cc934d8

Compatibility notes:
- TODO : What might have broken?

[Commits](https://github.com/jhudson8/react-events/compare/v0.4.2...v0.4.3)

## v0.4.2 - June 17th, 2014
- fix bower.json - 9ab5bbc
- update dependencies docs - 1aa6bbc

[Commits](https://github.com/jhudson8/react-events/compare/v0.4.1...v0.4.2)

## v0.4.1 - June 16th, 2014
- update dependencies - bda8de9
- allow for customer handlers to match the path by regular expression - 0bcdca0
- add bower.json - 8372180

[Commits](https://github.com/jhudson8/react-events/compare/v0.4.0...v0.4.1)

## v0.4.0 - June 12th, 2014
- added special callback wrappers (useful for throttling, cacheing and other reusable callback wrappers) - 3085655
- add object with "callback" parameter support with instance definitions to be able to refer to "this" as the component instance when declaring the callback function. - 55d5e2a

[Commits](https://github.com/jhudson8/react-events/compare/v0.3.0...v0.4.0)

## v0.3.0 - June 4th, 2014
- add 'repeat' and '!repeat' events - 9001bbf

[Commits](https://github.com/jhudson8/react-events/compare/v0.2.1...v0.3.0)

## v0.2.1 - May 22nd, 2014
- add custom events / forceUpdate unit tests - 30ae1dd
- do not send any arguments if the handler event name is "forceUpdate" as that will throw an exception by React - b7122fe

[Commits](https://github.com/jhudson8/react-events/compare/v0.2.0...v0.2.1)

## v0.2.0 - May 18th, 2014
- expose a new mixin: "triggerWith" - b62497a, fc5eb13
- bug fix: bind external "events" (on/off/trigger) object methods to state rather than just using "this" - f351712
- change handler API (not backwards compatible) - 381a352

[Commits](https://github.com/jhudson8/react-events/compare/v0.1.2...v0.2.0)

## v0.1.2 - May 16th, 2014
- added window existence check before including window events - b71d259

[Commits](https://github.com/jhudson8/react-events/compare/v0.1.1...v0.1.2)

## v0.1.1 - May 15th, 2014
- Update README.md
- fix author email address

[Commits](https://github.com/jhudson8/react-events/compare/1341bec...v0.1.1)
