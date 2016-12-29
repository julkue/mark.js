/*!*****************************************************
 * mark.js-website
 * https://github.com/julmot/mark.js/tree/website
 * Copyright (c) 2016–2017, Julian Motz
 * All Rights Reserved
 *******************************************************/
(function (global) {
    define([
        "jquery",
        "highlightjs",
        "bootstrap"
    ], function ($, highlightjs) {
        "use strict";
        $(function () {

            /**
             * DOM elements
             */
            var $window = $(window),
                $html = $("html"),
                $body = $("body"),

                $content = $("main"),
                $links = $body.find("a"),
                $anchorLinks = $links.filter("a[href*='#']:not([href='#'])"),
                $downloadLinks = $links.filter("a[href$='.zip']"),
                $tables = $content.find("table"),
                $nav = $("nav"),
                $navList = $nav.find("> ul"),
                $navbar = $(".navbar"),
                $jumbotron = $(".jumbotron"),

                $downloadModal = $("#downloadModal"),
                $downloadModalBtn = $downloadModal.find("button[data-action='download']"),

                $footer = $("footer");

            /**
             * Smooth scroll to anchors on the same page
             */
            function initScrollTo() {
                $anchorLinks.on("click", function (event) {
                    event.preventDefault();
                    var offset = $($(this).attr("href")).offset().top;
                    $html.add($body).animate({
                        "scrollTop": offset
                    }, {
                        "duration": 0
                    });
                });
            }

            /**
             * Affix sidebar navigation
             */
            function initAffixNav() {
                if($navList.length) {
                    $navList.affix({
                        offset: {
                            top: function () {
                                return $jumbotron.outerHeight(true);
                            },
                            bottom: function () {
                                return $footer.outerHeight(true);
                            }
                        }
                    });
                    // as the position is fixed, the nav list width needs to be like
                    // the container to avoid overflow
                    var resizeNav = function () {
                        var width = $nav.width() + "px";
                        $navList.css("width", width);
                    };
                    $navList.on("affix.bs.affix", resizeNav);
                    $window.resize(resizeNav);
                    resizeNav();

                    // Highlight related nav item on scroll
                    $body.scrollspy({
                        target: "nav",
                        offset: $navbar.outerHeight(true) + 30 // 30px tolerance
                    });
                }
            }

            /**
             * Syntax highlighting using highlight.js
             */
            function initSyntaxHighlighting() {
                $content.find("pre code").each(function (i, block) {
                    hljs.highlightBlock(block);
                });
            }

            /**
             * Initializes a modal that will appear in front of the download
             * button
             */
            function initDownloadModal() {
                $downloadLinks.on("click", function (e) {
                    e.preventDefault();
                    var $link = $(this);
                    $downloadModal.modal({
                        "show": true,
                        "backdrop": true
                    });
                    $downloadModalBtn.on("click", function (e) {
                        e.preventDefault();
                        window.location.href = $link.attr("href");
                    });
                });
            }

            /**
             * Sets a class "no-touch" on the body if the current device is not
             * a touch device. This can help to set specific styles (e.g.
             * :hover) only on particular devices.
             */
            function setNoTouchClass() {
                var touch = "ontouchstart" in window;
                var msTouch = window.navigator.msMaxTouchPoints > 0;
                if(!touch && !msTouch) {
                    $body.addClass("no-touch");
                }
            }

            initSyntaxHighlighting();
            initAffixNav();
            initScrollTo();
            initDownloadModal();
            setNoTouchClass();

        });
    });
})(this);
