# npm install -g typescript-formatter

Get-ChildItem *.ts -Recurse | ?{ -not $_.FullName.Contains("node_modules")} | % { tsfmt -r $_.FullName }
Get-ChildItem *.tsx -Recurse | ?{ -not $_.FullName.Contains("node_modules")} | % { tsfmt -r $_.FullName }
