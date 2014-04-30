/*global expect, ko, $, sinon, describe, it, beforeEach, afterEach*/

expect.addAssertion('[not] to be visible', function (expect, subject) {
    var state = this.flags.not ? 'hidden' : 'visible';
    expect($(subject).css('visibility'), 'to be', state);
});

expect.addAssertion('[not] to be rendered', function (expect, subject) {
    expect($(subject)[0], '[not] to be truthy');
});

describe('popupTemplate', function () {
    var $testElement;

    beforeEach(function () {
        $testElement = $('#test');
    });

    afterEach(function () {
        ko.cleanNode($testElement[0]);
        $testElement.empty();
    });

    function click(selector) {
        var event = $.Event('mousedown', { which: 1 });
        $(selector).trigger(event);
    }


    describe('defaults', function () {
        beforeEach(function () {
            $('<div id="anchor1" data-bind="popupTemplate: \'popupTemplate\'">Popup1</div>').appendTo($testElement);
            $('<div id="anchor2" data-bind="popupTemplate: \'popupTemplate3\'">Popup2</div>').appendTo($testElement);
            var bindingContext = {};
            ko.applyBindings(bindingContext, $testElement[0]);
        });

        it('renders a template in the body tag', function () {
            expect('body>.popupTemplate>#template', 'to be rendered');
        });

        it('hides the popup element at first', function () {
            expect('body>.popupTemplate>#template', 'not to be visible');
        });

        it('shows the popup when element is clicked', function () {
            click('#anchor1');
            expect('body>.popupTemplate>#template', 'to be visible');
        });

        it('hides the popup again on click outside popup', function () {
            click('#anchor1'); // Show popup
            click('body'); // Click outside
            expect('body>.popupTemplate>#template', 'not to be visible');
        });
        it('hides the popup again on click outside popup', function () {
            click('#anchor1'); // Show popup
            click('#anchor1'); // Click inside
            expect('body>.popupTemplate>#template', 'not to be visible');
        });

        it('works even with many open/closes', function () {
            for (var i = 0; i < 20; i += 1) {
                click('#anchor1'); // Show popup
                expect('body>.popupTemplate>#template', 'to be visible');
                click('body'); // Click outside
                expect('body>.popupTemplate>#template', 'not to be visible');
            }
        });

        it('does not hide on click within the popup', function () {
            click('#anchor1'); // Show popup
            click('body>.popupTemplate>#template'); // Click inside popup
            expect('body>.popupTemplate>#template', 'to be visible');
        });

        it('closes when a click hits another popup anchor', function () {
            expect('body>.popupTemplate>#template3', 'to be rendered');
            click('#anchor1'); // Show popup
            expect('body>.popupTemplate>#template', 'to be visible');
            click('#anchor2'); // Show popup
            expect('body>.popupTemplate>#template3', 'to be visible');
            expect('body>.popupTemplate>#template', 'not to be visible');
        });

        it('closes when clicked inside an iframe', function () {
            var $iframe = $('<iframe>');
            $testElement.append($iframe);
            var $iframeBody = $iframe.contents().find('body');
            $iframeBody.append('<div id="clicktarget">');
            click('#anchor1'); // Show popup
            expect('body>.popupTemplate>#template', 'to be visible');
            click($iframeBody.find('#clicktarget')); // Click in iframe
            expect('body>.popupTemplate>#template', 'not to be visible');
        });

        it("... even when it's the second iframe", function () {
            var $iframe = $('<iframe>');
            $testElement.append($iframe);
            $iframe = $('<iframe>');
            $testElement.append($iframe);
            var $iframeBody = $iframe.contents().find('body');
            $iframeBody.append('<div id="clicktarget">');
            click('#anchor1'); // Show popup
            expect('body>.popupTemplate>#template', 'to be visible');
            click($iframeBody.find('#clicktarget')); // Click in iframe
            expect('body>.popupTemplate>#template', 'not to be visible');
        });

        it('works even with many open/closes @slow', function () {
            var $iframe = $('<iframe>');
            $testElement.append($iframe);
            var $iframeBody = $iframe.contents().find('body');
            $iframeBody.append('<div id="clicktarget">');
            for (var i = 0; i < 20; i += 1) {
                click('#anchor1'); // Show popup
                expect('body>.popupTemplate>#template', 'to be visible');
                click($iframeBody.find('#clicktarget')); // Click in iframe
                expect('body>.popupTemplate>#template', 'not to be visible');
            }
        });

        it('positions the popup just below the element, aligning left borders', function () {
            var $anchor = $('#anchor1');
            click('#anchor1');
            var popupPosition = $('body>.popupTemplate').offset();
            var elementPosition = $anchor.offset();
            expect(popupPosition.left, 'to be', elementPosition.left);
            expect(popupPosition.top, 'to be', elementPosition.top + $anchor.height());
        });
    });

    describe('configurations', function () {
        describe('config objects and data models', function () {
            beforeEach(function () {
                $('<div data-bind="popupTemplate: config">Popup</div>').appendTo($testElement);
                var bindingContext = {
                    config: {
                        template: 'popupTemplate2',
                        data: {
                            testText: 'This is a test'
                        }
                    }
                };
                ko.applyBindings(bindingContext, $testElement[0]);
            });

            it('can accept a configuration object', function () {
                expect('body>.popupTemplate>#template', 'to be rendered');
            });

            it('renders the template with the given data model', function () {
                expect($('body>.popupTemplate>#template').html(), 'to be', 'This is a test');
            });
        });

        describe('render on open', function () {
            beforeEach(function () {
                $('<div data-bind="popupTemplate: config">Popup</div>').appendTo($testElement);
                var bindingContext = {
                    config: {
                        template: 'popupTemplate2',
                        data: {
                            testText: 'This is a test'
                        },
                        renderOnOpen: true
                    }
                };
                ko.applyBindings(bindingContext, $testElement[0]);
            });

            it('does not render the popup before opening', function () {
                expect('body>.popupTemplate>#template', 'not to be rendered');
            });

            it('renders and shows the popup when element is clicked', function () {
                click('#test>div');
                expect('body>.popupTemplate>#template', 'to be rendered');
            });

            it('removes the popup when element is closed again', function () {
                click('#test>div'); // Show popup
                click('body'); // Click outside
                expect('body>.popupTemplate>#template', 'not to be rendered');
            });

            it('works even with many open/closes', function () {
                for (var i = 0; i < 20; i += 1) {
                    click('#test>div'); // Show popup
                    expect('body>.popupTemplate>#template', 'to be rendered');
                    click('body'); // Click outside
                    expect('body>.popupTemplate>#template', 'not to be rendered');
                }
            });
        });

        describe('state observable', function () {
            var popupState;
            beforeEach(function () {
                popupState = ko.observable();
                $('<div data-bind="popupTemplate: config">Popup</div>').appendTo($testElement);
                var bindingContext = {
                    config: {
                        template: 'popupTemplate',
                        openState: popupState
                    }
                };
                ko.applyBindings(bindingContext, $testElement[0]);
            });

            it('sets the state observable to false initially', function () {
                expect(popupState(), 'to be false');
            });

            it('sets the state observable to true when opening the popup', function () {
                click('#test>div'); // Show popup
                expect(popupState(), 'to be true');
            });

            it('resets the state observable to false when closing the popup', function () {
                click('#test>div'); // Show popup
                click('body'); // Click outside
                expect(popupState(), 'to be false');
            });
            it('closes the popup if config.openState is set to false', function () {
                click('#test>div'); // Show popup
                expect('body>.popupTemplate>#template', 'to be visible');
                popupState(false);
                expect('body>.popupTemplate>#template', 'not to be visible');
            });
            it('opens the popup if config.openState is set to true', function () {
                expect('body>.popupTemplate>#template', 'not to be visible');
                popupState(true);
                expect('body>.popupTemplate>#template', 'to be visible');
            });
        });

        describe('handlers', function () {
            var beforeOpen, afterOpen, beforeClose, afterClose, popupState;
            beforeEach(function () {
                beforeOpen = sinon.spy();
                afterOpen = sinon.spy();
                beforeClose = sinon.spy();
                afterClose = sinon.spy();
                popupState = ko.observable();
                $('<div data-bind="popupTemplate: config">Popup</div>').appendTo($testElement);
                var bindingContext = {
                    config: {
                        template: 'popupTemplate',
                        beforeOpen: beforeOpen,
                        afterOpen: afterOpen,
                        beforeClose: beforeClose,
                        afterClose: afterClose,
                        openState: popupState
                    }
                };
                ko.applyBindings(bindingContext, $testElement[0]);
            });

            it('it calls the beforeOpen and afterOpen hooks in the right order', function () {
                click('#test>div'); // Show popup
                expect([beforeOpen, afterOpen], 'given call order');
                expect(beforeOpen, 'was called once');
                expect(afterOpen, 'was called once');
            });

            it('it calls the beforeClose and afterClose hooks in the right order', function () {
                click('#test>div'); // Show popup
                click('#test>div'); // Close popup
                expect([beforeClose, afterClose], 'given call order');
                expect(beforeClose, 'was called once');
                expect(afterClose, 'was called once');
            });
        });

        describe('positioning', function () {
            var config;
            beforeEach(function () {
                $('<div id="anchor" data-bind="popupTemplate: config" style="margin-left: 300px; width: 200px; height: 50px; padding: 5px; border: 1px solid black;">Popup</div>').appendTo($testElement);
            });

            it('accepts string positioning', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        horizontal: 'outside-right',
                        vertical: 'middle'
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                expect(config.positioning.horizontal, 'to equal', ko.observable('outside-right'));
                expect(config.positioning.vertical, 'to equal', ko.observable('middle'));
            });

            it('accepts empty or invalid observable positioning', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        horizontal: ko.observable(),
                        vertical: ko.observable('invalid')
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                expect(config.positioning.horizontal, 'to equal', ko.observable('inside-left'));
                expect(config.positioning.vertical, 'to equal', ko.observable('outside-bottom'));
            });

            it('accepts valid observable positioning', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        horizontal: ko.observable('middle'),
                        vertical: ko.observable('outside-top')
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                expect(config.positioning.horizontal, 'to equal', ko.observable('middle'));
                expect(config.positioning.vertical, 'to equal', ko.observable('outside-top'));
            });

            it('horizontal alignment outside-left', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        horizontal: 'outside-left'
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                var $anchor = $('#anchor');
                var $popup = $('body>.popupTemplate');
                click('#anchor');
                var popupPosition = $popup.offset();
                var elementPosition = $anchor.offset();
                expect(popupPosition.left, 'to be', elementPosition.left - $popup.outerWidth());
            });

            it('horizontal alignment inside-left', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        horizontal: 'inside-left'
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                var $anchor = $('#anchor');
                click('#anchor');
                var popupPosition = $('body>.popupTemplate').offset();
                var elementPosition = $anchor.offset();
                expect(popupPosition.left, 'to be', elementPosition.left);
            });

            it('horizontal alignment middle', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        horizontal: 'middle'
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                config.positioning.horizontal('middle');
                click('#anchor');
                var $anchor = $('#anchor');
                var $popup = $('body>.popupTemplate');
                expect($popup.offset().left + Math.round($popup.width() / 2), 'to be', $anchor.offset().left + Math.round($anchor.outerWidth() / 2));
            });

            it('horizontal alignment inside-right', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        horizontal: 'inside-right'
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                var $anchor = $('#anchor');
                var $popup = $('body>.popupTemplate');
                click('#anchor');
                var popupPosition = $popup.offset();
                var elementPosition = $anchor.offset();
                expect(popupPosition.left + $popup.width(), 'to be', elementPosition.left + $anchor.outerWidth());
            });

            it('horizontal alignment outside-right', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        horizontal: 'outside-right'
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                var $anchor = $('#anchor');
                var $popup = $('body>.popupTemplate');
                click('#anchor');
                var popupPosition = $popup.offset();
                var elementPosition = $anchor.offset();
                expect(popupPosition.left, 'to be', elementPosition.left + $anchor.outerWidth());
            });

            it('vertical alignment outside-top', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        vertical: 'outside-top'
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                var $anchor = $('#anchor');
                var $popup = $('body>.popupTemplate');
                click('#anchor');
                var popupPosition = $popup.offset();
                var elementPosition = $anchor.offset();
                console.log(popupPosition.top, elementPosition.top, $popup.height());
                expect(popupPosition.top, 'to be', elementPosition.top - $popup.height());
            });

            it('vertical alignment inside-top', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        vertical: 'inside-top'
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                var $anchor = $('#anchor');
                var $popup = $('body>.popupTemplate');
                click('#anchor');
                var popupPosition = $popup.offset();
                var elementPosition = $anchor.offset();
                expect(popupPosition.top, 'to be', elementPosition.top);
            });

            it('vertical alignment middle', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        vertical: 'middle'
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                config.positioning.vertical('middle');
                var $anchor = $('#anchor');
                var $popup = $('body>.popupTemplate');
                click('#anchor');
                expect($popup.offset().top + Math.round($popup.height() / 2), 'to be', $anchor.offset().top + Math.round($anchor.outerHeight() / 2));
            });

            it('vertical alignment inside-bottom', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        vertical: 'inside-bottom'
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                var $anchor = $('#anchor');
                var $popup = $('body>.popupTemplate');
                click('#anchor');
                var popupPosition = $popup.offset();
                var elementPosition = $anchor.offset();
                expect(popupPosition.top + $popup.height(), 'to be', elementPosition.top + $anchor.outerHeight());
            });


            it('vertical alignment outside-bottom', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        vertical: 'outside-bottom'
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                var $anchor = $('#anchor');
                click('#anchor');
                var popupPosition = $('body>.popupTemplate').offset();
                var elementPosition = $anchor.offset();
                expect(popupPosition.top, 'to be', elementPosition.top + $anchor.outerHeight());
            });

            it('can reposition while open', function () {
                config = {
                    template: 'popupTemplate',
                    positioning: {
                        horizontal: ko.observable('inside-left'),
                        vertical: ko.observable('outside-bottom')
                    }
                };
                ko.applyBindings({ config: config }, $testElement[0]);
                var $anchor = $('#anchor');
                var $popup = $('body>.popupTemplate');
                click('#anchor');
                expect($popup.offset().left, 'to be', $anchor.offset().left);
                expect($popup.offset().top, 'to be', $anchor.offset().top + $anchor.outerHeight());
                config.positioning.horizontal('outside-left');
                expect($popup.offset().left, 'to be', $anchor.offset().left - $popup.outerWidth());
                config.positioning.vertical('inside-bottom');
                expect($popup.offset().top + $popup.height(), 'to be', $anchor.offset().top + $anchor.outerHeight());
            });
        });
    });
});
