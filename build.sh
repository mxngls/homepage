#!/bin/bash

source_dir='content'
target_dir='docs'

args=(
	-C builder

	# static site generator specific
	_SITE_EXT_SOURCE_DIR="../$source_dir"
	_SITE_EXT_TARGET_DIR="../$target_dir"
	_SITE_EXT_GIT_DIR='../.git'

	# atom feed specific
	_SITE_EXT_TITLE="\"Max's Homepage\""
	_SITE_EXT_AUTHOR="\"Maximilian Hoenig\""
	_SITE_EXT_FEED_ID='b8792f75-efae-40fa-a5b6-e12cfb06dfaa'
	_SITE_EXT_HOST='seoul.systems'
	_SITE_EXT_TAG_SCHEME_DATE='2025-03-02'
)

# Add macOS-specific arguments
if [[ "$(uname)" == "Darwin" ]]; then
	args+=(SYSTEM_LIBS='-lz -liconv -framework CoreFoundation -framework Security')
fi

# fail before the build rather than after it. an array, because the npm
# package has no binary of its own -- it is JavaScript, and the fallback runs
# it through node directly when npm has left no launcher behind
if [[ -x node_modules/.bin/sass ]]; then
	sass_cmd=(node_modules/.bin/sass)
elif [[ -f node_modules/sass/sass.js ]]; then
	sass_cmd=(node node_modules/sass/sass.js)
elif command -v sass >/dev/null; then
	sass_cmd=(sass)
else
	printf '%s\n' "sass not found -- run 'npm install', or: brew install sass/sass/sass" >&2
	exit 1
fi

make "${args[@]}" "$@" || exit

# The default target is deploy, which empties the target directory,
# but does not clean up after itself, so the markup layer is compiled 
# in afterwards, which we don't want
if [[ " $* " != *' clean '* && " $* " != *' distclean '* ]]; then
	printf '%s\n' "Compiling $source_dir/html.scss..."
	"${sass_cmd[@]}" "$source_dir/html.scss" "$target_dir/html.css" \
		--no-source-map --style=expanded || exit
	rm -f "$target_dir/html.scss"
fi
