#!/bin/bash

args=(
	-C builder

	# static site generator specific
	_SITE_EXT_SOURCE_DIR='../content'
	_SITE_EXT_TARGET_DIR='../docs'
	_SITE_EXT_SITE_INDEX='index.htm'
	_SITE_EXT_BLOG_INDEX='index.htm'
	_SITE_EXT_GIT_DIR='../.git'
	_SITE_EXT_EXEMPT_EXTRA='\"work.htm\",\"contact.htm\"'

	# atom feed specific
	_SITE_EXT_TITLE="\"Max's Homepage\""
	_SITE_EXT_AUTHOR="\"Maximilian Hoenig\""
	_SITE_EXT_FEED_ID='b8792f75-efae-40fa-a5b6-e12cfb06dfaa'
	_SITE_EXT_HOST='maxh.site'
	_SITE_EXT_TAG_SCHEME_DATE='2025-03-02'
)

# Add macOS-specific arguments
if [[ "$(uname)" == "Darwin" ]]; then
	args+=(SYSTEM_LIBS='-lz -liconv -framework CoreFoundation -framework Security')
fi

make "${args[@]}" "$@"
