# AgarIO Hub Desktop

This is the official repository for the AgarIO Hub desktop application.  
**Never install the application from any source other than our [GitHub Releases](https://github.com/AgarIO-Hub/Desktop/releases) or the [AgarIO Hub website](https://agariohub.xyz/download).**

## Contributing

To contribute to this project:

1. Clone the repository:  
    `git clone https://github.com/AgarIO-Hub/Desktop.git`
2. Install dependencies:  
    `npm install`
3. Push your changes to the `main` branch.

> ⚠️ All changes are subject to review before being merged.

### Contribution Guidelines

- Contributions must introduce meaningful changes.
- All changes should be tested prior to submission.
- Commit messages must clearly describe the changes made.
- Pull requests must be submitted to the `main` branch. _(This may change in the future.)_
- Avoid adding new dependencies unless absolutely necessary.
- Do not modify `package.json` or `package-lock.json` unless updating dependencies (which should also be avoided when possible).

## Developer Config

```json
{
  "devtools": false, // Launches the app with Chrome Developer Tools
  "splash": true // Whether to show the splash screen on launch
}
```
