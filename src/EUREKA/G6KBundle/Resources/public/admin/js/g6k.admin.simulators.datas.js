/**
The MIT License (MIT)

Copyright (c) 2015 Jacques Archimède

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function (global) {
	'use strict';

	Simulators.dataBackup = null;
	Simulators.datagroupBackup = null;
	Simulators.dataChoicesBackup = null;
	Simulators.dataset = {};
	Simulators.datagroups = {};

	Simulators.collectDataset = function() {
		$('#datas .data-container').each(function(d) {
			if ($(this).hasClass('datagroup')) {
				var name = $(this).find(".attributes-container p[data-attribute='name']").attr('data-value');
				var datagroup = {
					id:  $(this).attr('data-id'),
					label: $(this).find(".attributes-container p[data-attribute='label']").attr('data-value'),
					description: $(this).parent().find(".datagroup-description").html()
				};
				Simulators.datagroups[name] = datagroup;
				$(this).parent().find('.datagroup-data-container').each(function(d) {
					var choices = [];
					$(this).parent().find('.choice-container').each(function(d) {
						choices.push({
							id:  $(this).attr('data-id'),
							name: $(this).find("p[data-attribute='value']").attr('data-value'),
							label: $(this).find("p[data-attribute='label']").attr('data-value'),
						});
					});
					var name = $(this).find("p[data-attribute='name']").attr('data-value');
					var data = {
						id:  parseInt($(this).attr('data-id')),
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
						type: $(this).find("p[data-attribute='type']").attr('data-value'),
						description: $(this).parent().find(".data-description").html()
					};
					if (choices.length > 0) {
						data['options'] = choices;
					}
					Simulators.dataset[name] = data;
				});
			} else {
				var choices = [];
				$(this).parent().find('.choice-container').each(function(d) {
					choices.push({
						id:  $(this).attr('data-id'),
						name: $(this).find("p[data-attribute='value']").attr('data-value'),
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
					});
				});
				var name = $(this).find("p[data-attribute='name']").attr('data-value');
				var data = {
					id:  $(this).attr('data-id'),
					label: $(this).find("p[data-attribute='label']").attr('data-value'),
					type: $(this).find("p[data-attribute='type']").attr('data-value'),
					description: $(this).parent().find(".data-description").html()
				};
				if (choices.length > 0) {
					data['options'] = choices;
				}
				Simulators.dataset[name] = data;
			}
		});
		Simulators.dataset['script'] = {
			'id': 20000, 
			'label': Translator.trans('Script'),
			'type': 'choice',
			'options': [
				{
					'label': Translator.trans('Disabled'),
					'name': 0
				},
				{
					'label': Translator.trans('Enabled'),
					'name': 1
				}
			]
		};
		Simulators.dataset['dynamic'] = {
			'id': 20001, 
			'label': Translator.trans('Interactive UI'),
			'type': 'choice',
			'options': [
				{
					'label': Translator.trans('No'),
					'name': 0
				},
				{
					'label': Translator.trans('Yes'),
					'name': 1
				}
			]
		};
		$('#steps .step-container').each(function() {
			Simulators.addStepToDataset($(this).attr('data-id'));
		});
	}

	Simulators.addStepToDataset = function(id) {
		Simulators.dataset['step' + id + '.dynamic'] = {
			'id': 10000 + parseInt(id), 
			'label': Translator.trans('Is step %id% interactive ?', { 'id': id }),
			'type': 'choice',
			'options': [
				{
					'label': Translator.trans('No'),
					'name': 0
				},
				{
					'label': Translator.trans('Yes'),
					'name': 1
				}
			]
		};
	}

	Simulators.deleteStepInDataset = function(id) {
		delete Simulators.dataset['step' + id + '.dynamic'];
	}

	Simulators.findDatagroupNameById = function(id) {
		var result = null;
		$.each(Simulators.datagroups, function(name, datagroup) {
			if (datagroup.id == id) {
				result = name;
				return false;
			}
		});
		return result;
	}

	Simulators.findDataById = function(id) {
		var result = null;
		$.each(Simulators.dataset, function(name, data) {
			if (data.id == id) {
				result = data;
				return false;
			}
		});
		return result;
	}

	Simulators.findDataNameById = function(id) {
		var result = null;
		$.each(Simulators.dataset, function(name, data) {
			if (data.id == id) {
				result = name;
				return false;
			}
		});
		return result;
	}

	Simulators.replaceByDataLabel = function(target) {
		return target.replace(
			/#(\d+)/g, 
			function(match, p1) {
				var data = Simulators.findDataById(p1);
				return data != null ? '«' + data.label + '»' : "#" + p1;
			}
		);
	}

	Simulators.getChoiceLabel = function(data, name) {
		var result = "";
		$.each(data.options, function(o, option) {
			if (option.name == name) {
				result = option.label;
				return false;
			}
		});
		return result;
	}

	Simulators.maxDatasetId = function() {
		var maxId = 0;
		$.each(Simulators.dataset, function(name, data) {
			var id = parseInt(data.id);
			if (id > maxId && ! /(dynamic|script)$/.test(name)) {
				maxId = id;
			}
		});
		return maxId;
	}

	Simulators.renumberDatas = function(panelGroups) {
		panelGroups.each(function(index) {
			var dataContainer = $(this).find("div.data-container");
			var oldId = dataContainer.attr('data-id');
			var id = index + 1;
			if (id != oldId) {
				var data = Simulators.findDataById(oldId);
				$(this).attr('id', 'data-' + id);
				var re = new RegExp("data-" + oldId + '([^\\d])?', 'g');
				var a = $(this).find('> .panel > .panel-heading').find('> h4 > a');
				a.text(' #' + id + ' : ' + data.label + ' ');
				var descendants = $(this).find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "data-" + id + '$1');
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "data-" + id + '$1');
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "data-" + id + '$1');
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "data-" + id + '$1');
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "data-" + id + '$1');
						$(this).attr('aria-labelledby', attr);
					}
				});
				Simulators.changeDataIdInRules(oldId, 'X' + id)
				Simulators.changeDataIdInSteps(oldId, 'X' + id)
				Simulators.changeDataIdInRichText(oldId, 'X' + id);
				Simulators.changeDataIdInExpression(oldId, 'X' + id);
			}
		});
		panelGroups.each(function(index) {
			var dataContainer = $(this).find("div.data-container");
			var oldId = dataContainer.attr('data-id');
			var id = index + 1;
			if (id != oldId) {
				dataContainer.attr('data-id', id);
				var data = Simulators.findDataById(oldId);
				data.id = id;
				Simulators.changeDataIdInRules('X' + data.id, data.id);
				Simulators.changeDataIdInSteps('X' + data.id, data.id);
				Simulators.changeDataIdInRichText('X' + data.id, data.id);
				Simulators.changeDataIdInExpression('X' + data.id, data.id);
			}
		});
	}

	Simulators.bindSortableDatas = function(container) {
		if (! container ) {
			container = $("#page-simulators #collapsedatas");
		}
		container.find("> .sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				var self = $(this);
				var container = $(ui.item).find('.data-container');
				var id = container.attr('data-id');
				var newId =  ui.item.index();
				Simulators.renumberDatas($(ui.item).parent().find('> div'));
				// TODO: update data id in rules and fields
				$('.update-button').show();
				$('.toggle-collapse-all').show();
				Admin.updated = true;
			}
		});
	}

	Simulators.bindDataButtons = function(container) {
		if (! container ) {
			container = $("#simulator");
		}
		container.find('button.edit-data').click(function(e) {
		    e.preventDefault();
			Simulators.editData($($(this).attr('data-parent')));
		});
		container.find('button.delete-data').click(function(e) {
		    e.preventDefault();
			Simulators.deleteData($($(this).attr('data-parent')));
		});
	}

	Simulators.bindData = function(dataPanelContainer) {
		dataPanelContainer.find('textarea').wysihtml5(Admin.wysihtml5Options);
		dataPanelContainer.find('select[data-attribute=type]').select2({
			language: Admin.lang,
			minimumResultsForSearch: 50
		});
		dataPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		dataPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		dataPanelContainer.find('.cancel-edit-data').click(function() {
			dataPanelContainer.replaceWith(Simulators.dataBackup);
			Simulators.dataBackup.find('button.edit-data').click(function(e) {
				e.preventDefault();
				Simulators.editData($($(this).attr('data-parent')));
			});
			Simulators.dataBackup.find('button.delete-data').click(function(e) {
				e.preventDefault();
				Simulators.deleteData($($(this).attr('data-parent')));
			});
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		dataPanelContainer.find('.cancel-add-data').click(function() {
			dataPanelContainer.remove();
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		dataPanelContainer.find('.validate-edit-data, .validate-add-data').click(function() {
			var dataContainerGroup = dataPanelContainer.parent();
			var dataContainer = dataPanelContainer.find('.data-container');
			if (! Simulators.checkData(dataPanelContainer)) {
				return false;
			}
			var attributes = dataContainer.find('.attributes-container');
			var data = { id: dataContainer.attr('data-id') };
			attributes.find('input.simple-value, select.simple-value, span.attribute-expression').each(function (index) {
				var value;
				if ($(this).hasClass('attribute-expression')) {
					value = $(this).expressionbuilder('val');
				} else {
					value = $(this).val();
				}
				data[$(this).attr('data-attribute')] = value;
			});
			data['description'] =  dataPanelContainer.find('.data-description').val();
			var newDataPanel = Simulators.drawDataForDisplay(data);
			var choices = [];
			if (data.type == 'choice') {
				var choicesPanel = Simulators.drawChoicesForDisplay(data.id);
				var choicesContainer = choicesPanel.find('> .panel-body');
				var id = 0;
				dataPanelContainer.find('.choice-panel').each(function (index) {
					var values = $(this).find('input');
					choices.push({
						id:  ++id,
						name: values.eq(0).val(),
						label: values.eq(1).val()
					});
					choicesContainer.append(Simulators.drawChoiceForDisplay({
						id: id,
						value: values.eq(0).val(),
						label: values.eq(1).val()
					}));
				});
				dataPanelContainer.find('.choice-source-container').each(function (index) {
					var values = $(this).find('input');
					var choiceSource = {
						id: $(this).attr('data-id'),
						valueColumn: values.eq(0).val(),
						labelColumn: values.eq(1).val(),
						idColumn: ''
					};
					if (values.length > 2) {
						choiceSource.idColumn = values.eq(2).val();
					}
					choicesContainer.append(Simulators.drawChoiceSourceForDisplay(choiceSource));
				});
				newDataPanel.find('.collapse').find('> .panel-body').append(choicesPanel);
			}
			dataPanelContainer.replaceWith(newDataPanel);
			newDataPanel.find('button.edit-data').click(function(e) {
				e.preventDefault();
				Simulators.editData($($(this).attr('data-parent')));
			});
			newDataPanel.find('button.delete-data').click(function(e) {
				e.preventDefault();
				Simulators.deleteData($($(this).attr('data-parent')));
			});
			Simulators.dataChoicesBackup = null;
			if ($(this).hasClass('validate-edit-data')) {
				var name = Simulators.dataBackup.find("p[data-attribute='name']").attr('data-value');
				delete Simulators.dataset[name];
			}
			Simulators.dataset[data.name] = {
				id: data.id,
				label: data.label,
				type: data.type,
				description: data.description
			}
			if (choices.length > 0) {
				Simulators.dataset[data.name].options = choices;
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			$("html, body").animate({ scrollTop: newDataPanel.offset().top }, 500);
			Simulators.updating = false;
		});
		dataPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		dataPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		dataPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
		dataPanelContainer.find('select[data-attribute=type]').change(function(e) {
			var type = $(this).val();
			if (type === 'choice') {
				var choicesPanel;
				if (Simulators.dataChoicesBackup) {
					choicesPanel = Simulators.dataChoicesBackup;
				} else {
					var typeId = $(this).attr('id');
					var id = typeId.match(/^data-(\d+)-type/)[1];
					choicesPanel = Simulators.drawChoicesForInput(id);
					choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
					choicesPanel.find('.edit-choice-source').removeClass('update-button').hide();
				}
				dataPanelContainer.find('.description-panel').after(choicesPanel);
				Simulators.bindChoices(choicesPanel);
			} else {
				Simulators.dataChoicesBackup = dataPanelContainer.find('.choices-panel').detach();
			}
		});
		dataPanelContainer.find('.attribute-expression').each(function( index ) {
			var expression = $( this );
			expression.expressionbuilder({
				fields: Simulators.dataset,
				constants: Simulators.expressionOptions.constants,
				functions: Simulators.expressionOptions.functions,
				operators: Simulators.expressionOptions.operators,
				initial: expression.attr('data-value'),
				onCompleted: Simulators.expressionOptions.onCompleted,
				onEditing: Simulators.expressionOptions.onEditing,
				onError: Simulators.expressionOptions.onError,
				language: Simulators.expressionOptions.language,
				operandHolder: Simulators.expressionOptions.operandHolder,
				operatorHolder: Simulators.expressionOptions.operatorHolder,
				nestedExpression: Simulators.expressionOptions.nestedExpression
			});
		});
	}

	Simulators.bindDatagroupButtons = function(container) {
		if (! container ) {
			container = $("#simulator");
		}
		container.find('button.edit-datagroup').click(function(e) {
		    e.preventDefault();
			Simulators.editDatagroup($($(this).attr('data-parent')));
		});
		container.find('button.delete-datagroup').click(function(e) {
		    e.preventDefault();
			Simulators.deleteDatagroup($($(this).attr('data-parent')));
		});
		container.find('button.add-data').click(function(e) {
		    e.preventDefault();
			Simulators.addData($($(this).attr('data-parent')));
		});
	}

	Simulators.bindDatagroup = function(dataPanelContainer) {
		dataPanelContainer.find('textarea').wysihtml5(Admin.wysihtml5Options);
		dataPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		dataPanelContainer.find('.cancel-edit-datagroup').click(function() {
			dataPanelContainer.replaceWith(Simulators.datagroupBackup);
			Simulators.datagroupBackup.find('button.edit-datagroup').click(function(e) {
				e.preventDefault();
				Simulators.editDatagroup($($(this).attr('data-parent')));
			});
			Simulators.datagroupBackup.find('button.add-data').click(function(e) {
				e.preventDefault();
				Simulators.addData($($(this).attr('data-parent')));
			});
			Simulators.datagroupBackup.find('button.delete-datagroup').click(function(e) {
				e.preventDefault();
				Simulators.deleteDatagroup($($(this).attr('data-parent')));
			});
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		dataPanelContainer.find('.cancel-add-datagroup').click(function() {
			dataPanelContainer.remove();
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		dataPanelContainer.find('.validate-edit-datagroup, .validate-add-datagroup').click(function() {
			var dataContainerGroup = dataPanelContainer.parent();
			var dataContainer = dataPanelContainer.find('.data-container');
			if (! Simulators.checkDatagroup(dataPanelContainer)) {
				return false;
			}
			var attributes = dataContainer.find('.attributes-container');
			var datagroup = { id: dataContainer.attr('data-id') };
			attributes.find('input.simple-value').each(function (index) {
				var value = $(this).val();
				datagroup[$(this).attr('data-attribute')] = value;
			});
			datagroup['description'] =  dataPanelContainer.find('.datagroup-description').val();
			var newDataPanel = Simulators.drawDatagroupForDisplay(datagroup);
			newDataPanel.find('.description-panel').after(dataPanelContainer.find('.datas-panel'));
			dataPanelContainer.replaceWith(newDataPanel);
			newDataPanel.find('button.edit-datagroup').click(function(e) {
				e.preventDefault();
				Simulators.editDatagroup($($(this).attr('data-parent')));
			});
			newDataPanel.find('button.add-data').click(function(e) {
				e.preventDefault();
				Simulators.addData($($(this).attr('data-parent')));
			});
			newDataPanel.find('button.delete-datagroup').click(function(e) {
				e.preventDefault();
				Simulators.deleteDatagroup($($(this).attr('data-parent')));
			});
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
		});
	}

	Simulators.bindChoices = function(choicesPanel) {
		choicesPanel.find('button.add-choice').click(function(e) {
			var choicesContainer = choicesPanel.find('> .panel-body');
			var id = choicesContainer.children('div.panel').length + 1;
			var dataId = choicesPanel.attr('id').match(/^data-(\d+)/)[1];
			var choice = {
				id: id,
				dataId: dataId,
				value: '',
				label: ''
			};
			var choicePanel = Simulators.drawChoiceForInput(choice);
			choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
			choicesContainer.append(choicePanel);
			Simulators.bindChoice(choicePanel);
		});
		choicesPanel.find('button.add-choice-source').click(function(e) {
			var choicesContainer = choicesPanel.find('> .panel-body');
			var dataId = choicesPanel.attr('id').match(/^data-(\d+)/)[1];
			var choiceSource = {
				id: 1,
				dataId: dataId,
				idColumn: '',
				valueColumn: '',
				labelColumn: ''
			};
			var choicePanel = Simulators.drawChoiceSourceForInput(choiceSource);
			choicesPanel.find('button.add-choice').removeClass('update-button').hide();
			choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
			choicesPanel.find('button.delete-choice-source').addClass('update-button').show();
			choicesContainer.append(choicePanel);
			Simulators.bindChoiceSource(choicePanel);
		});
		choicesPanel.find('button.delete-choice-source').click(function(e) {
			var choicesContainer = choicesPanel.find('> .panel-body');
			choicesContainer.find('.attributes-container').remove();
			choicesPanel.find('button.add-choice').addClass('update-button').show();
			choicesPanel.find('button.add-choice-source').addClass('update-button').show();
			choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
		});
	}

	Simulators.drawChoicesForDisplay = function(dataId) {
		var choicesPanel = $('<div>', { 'class': 'panel panel-default choices-panel', id: 'data-' + dataId + '-choices-panel' });
		choicesPanel.append('<div class="panel-heading">' + Translator.trans('Choices') + '</div>');
		var choicesPanelBody = $('<div class="panel-body"></div>');
		choicesPanel.append(choicesPanelBody);
		return choicesPanel;
	}

	Simulators.drawChoicesForInput = function(dataId) {
		var choicesPanel = $('<div>', { 'class': 'panel panel-default choices-panel', id: 'data-' + dataId + '-choices-panel' });
		choicesPanel.append('<div class="panel-heading"><button class="btn btn-default pull-right update-button delete-choice-source">' + Translator.trans('Delete source') + ' <span class="glyphicon glyphicon-minus-sign"></span></button><button class="btn btn-default pull-right update-button add-choice-source">' + Translator.trans('Add source') + ' <span class="glyphicon glyphicon-plus-sign"></span></button><button class="btn btn-default pull-right update-button add-choice">' + Translator.trans('Add choice') + ' <span class="glyphicon glyphicon-plus-sign"></span></button>' + Translator.trans('Choices') + '</div>');
		var choicesPanelBody = $('<div class="panel-body"></div>');
		choicesPanel.append(choicesPanelBody);
		return choicesPanel;
	}

	Simulators.bindChoice = function(choicePanel) {
		choicePanel.find('button.delete-choice').click(function(e) {
			var choicesPanel = choicePanel.parents('.choices-panel');
			choicePanel.remove();
			if (choicesPanel.find('> .panel-body').children().length == 0) {
				var choicesPanelHeading = choicesPanel.find('> .panel-heading');
				choicesPanelHeading.find('button.add-choice-source').addClass('update-button').show();
			}
		});
	}

	Simulators.drawChoiceForDisplay = function(choice) {
		var choicePanel = $('<div>', { 'class': 'panel panel-default choice-container',  'data-id': choice.id });
		choicePanel.append('<div class="panel-heading">' + Translator.trans('Choice %id%', { 'id': choice.id }) + '</div>');
		var choicePanelBody = $('<div>', { 'class': 'panel-body', id: 'data-' + choice.dataId + '-choice-' + choice.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choice.dataId + '-choice-' + choice.id, 'text', 'value', Translator.trans('Value'), choice.value, true, Translator.trans('Choice value')));
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choice.dataId + '-choice-' + choice.id, 'text', 'label', Translator.trans('Label'), choice.label, true, Translator.trans('Choice label')));
		attributesContainer.append(attributes);
		choicePanelBody.append(attributesContainer);
		choicePanel.append(choicePanelBody);
		return choicePanel;
	}

	Simulators.drawChoiceForInput = function(choice) {
		var choicePanel = $('<div>', { 'class': 'panel panel-default choice-panel',  'data-id': choice.id  });
		choicePanel.append('<div class="panel-heading"><button class="btn btn-default pull-right update-button delete-choice">' + Translator.trans('Delete') + ' <span class="glyphicon glyphicon-minus-sign"></span></button>' + Translator.trans('Choice %id%', {'id': choice.id}) + '</div>');
		var choicePanelBody = $('<div>', { 'class': 'panel-body', id: 'data-' + choice.dataId + '-choice-' + choice.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append('<div class="form-group col-sm-12"><label for="data-' + choice.dataId + '-choice-' + choice.id + '-value" class="col-sm-4 control-label">' + Translator.trans('Value') + '</label><div class="col-sm-8"><input type="text" name="data-' + choice.dataId + '-choice-' + choice.id + '-value" id="data-' + choice.dataId + '-choice-' + choice.id + '-value" class="form-control simple-value" placeholder="' + Translator.trans('Choice value') + '"  value="' + choice.value + '" /></div></div>');
		attributes.append('<div class="form-group col-sm-12"><label for="data-' + choice.dataId + '-choice-' + choice.id + '-label" class="col-sm-4 control-label">' + Translator.trans('Label') + '</label><div class="col-sm-8"><input type="text" name="data-' + choice.dataId + '-choice-' + choice.id + '-label" id="data-' + choice.dataId + '-choice-' + choice.id + '-label" class="form-control simple-value" placeholder="' + Translator.trans('Choice label') + '"  value="' + choice.label + '" /></div></div>');
		attributesContainer.append(attributes);
		choicePanelBody.append(attributesContainer);
		choicePanel.append(choicePanelBody);
		return choicePanel;
	}

	Simulators.bindChoiceSource = function(choiceSourceContainer) {
		choiceSourceContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		choiceSourceContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		choiceSourceContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		choiceSourceContainer.find('> div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
	}

	Simulators.drawChoiceSourceForDisplay = function(choiceSource) {
		var attributesContainer = $('<div class="attributes-container choice-source-container" data-id="' + choiceSource.id + '"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id, 'text', 'idColumn', Translator.trans('Source column id'), choiceSource.idColumn, false, Translator.trans('Source column id')));
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id, 'text', 'valueColumn', Translator.trans('Source column value'), choiceSource.valueColumn, true, Translator.trans('Source column value')));
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id, 'text', 'labelColumn', Translator.trans('Source column label'), choiceSource.labelColumn, true, Translator.trans('Source column label')));
		attributesContainer.append(attributes);
		return attributesContainer;
	}

	Simulators.drawChoiceSourceForInput = function(choiceSource) {
		var attributesContainer = $('<div class="attributes-container choice-source-container" data-id="' + choiceSource.id + '"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-valueColumn', 'text', 'valueColumn', Translator.trans('Source column value'), choiceSource.valueColumn, true, Translator.trans('Source column value')));
		attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-labelColumn', 'text', 'labelColumn', Translator.trans('Source column label'), choiceSource.labelColumn, true, Translator.trans('Source column label')));
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" data-element="data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '" data-type="text" data-name="idColumn" data-placeholder="' + Translator.trans('Source column id value') + '">' + Translator.trans('Source column id') + '</li>');
		optionalAttributes.append(optionalAttribute);
		optionalAttributesPanel.append(optionalAttributes);
		if (choiceSource.idColumn) {
			attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-idColumn', 'text', 'idColumn', Translator.trans('Source column id'), choiceSource.idColumn, false, Translator.trans('Source column id')));
			optionalAttribute.hide();
		}
		attributesContainer.append(attributes);
		attributesContainer.append(optionalAttributesPanel);
		return attributesContainer;
	}

	Simulators.drawDataForDisplay = function(data) {
		var dataElementId = 'data-' + data.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'panel panel-info' });
		dataPanel.append('<div class="panel-heading" role="tab" id="' + dataElementId + '-panel"><button class="btn btn-info pull-right update-button delete-data" data-parent="#' + dataElementId + '">' + Translator.trans('Delete') + ' <span class="glyphicon glyphicon-minus-sign"></span></button><button class="btn btn-info pull-right update-button edit-data" data-parent="#' + dataElementId + '">' + Translator.trans('Edit') + ' <span class="glyphicon glyphicon-pencil"></span></button><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">#' + data.id + ' : ' + data.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="panel-body"></div>');
		var dataContainer = $('<div class="panel panel-default data-container" id="' + dataElementId + '-attributes-panel" data-id="' + data.id + '"></div>');
		var dataContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'name', Translator.trans('Name'), data.name, true, Translator.trans('Data name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'label', Translator.trans('Label'), data.label, true, Translator.trans('Data label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'select', 'type', Translator.trans('Type'), data.type, true, Translator.trans('Select a data type'), JSON.stringify(Admin.types)));
		$.each(Simulators.optionalAttributes, function (name, attr) {
			if (data[name]) {
				var attribute = attr.type === 'expression' ?
					Simulators.expressionAttributeForDisplay(dataElementId, name, attr.label, data[name], false, attr.placeholder) :
					Simulators.simpleAttributeForDisplay(dataElementId, attr.type, name, attr.label, data[name], false, attr.placeholder);
				requiredAttributes.append(attribute);
			} 
		});
		attributesContainer.append(requiredAttributes);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="panel panel-default" id="' + dataElementId + '-description-panel"><div class="panel-heading">' + Translator.trans('Description') + '</div><div class="panel-body data-description rich-text">' + data.description + '</div></div>');
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.drawDataForInput = function(data) {
		var dataElementId = 'data-' + data.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'panel panel-info' });
		dataPanel.append('<div class="panel-heading" role="tab" id="' + dataElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">#' + data.id + ' : ' + data.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="panel-body"></div>');
		var dataContainer = $('<div class="panel panel-default data-container" id="' + dataElementId + '-attributes-panel" data-id="' + data.id + '"></div>');
		var dataContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append('<div class="form-group col-sm-12"><label for="' + dataElementId + '-name" class="col-sm-4 control-label">' + Translator.trans('Name') + '</label><div class="col-sm-8"><input type="text" name="' + dataElementId + '-name" id="' + dataElementId + '-name" data-attribute="name" class="form-control simple-value" placeholder="' + Translator.trans('Data name without spaces or special characters') + '" value="' + data.name + '" /></div></div>');
		requiredAttributes.append('<div class="form-group col-sm-12"><label for="' + dataElementId + '-label" class="col-sm-4 control-label">' + Translator.trans('Label') + '</label><div class="col-sm-8"><input type="text" name="' + dataElementId + '-label" id="' + dataElementId + '-label" data-attribute="label" class="form-control simple-value" placeholder="' + Translator.trans('Data label') + '" value="' + data.label + '" /></div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(dataElementId + '-type', 'select', 'type', 'Type', data.type, true, Translator.trans('Select a data type'), JSON.stringify(Admin.types)));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		$.each(Simulators.optionalAttributes, function (name, attr) {
			var optionalAttribute = attr.type === 'expression' ?
				$('<li class="list-group-item" data-element="' + dataElementId + '" data-type="text" data-name="' + name + '" data-expression="true" data-placeholder="' + attr.placeholder + ' value">' + attr.label + '</li>') :
				$('<li class="list-group-item" data-element="' + dataElementId + '" data-type="' + attr.type + '" data-name="' + name + '" data-placeholder="' + attr.placeholder + ' value">' + attr.label + '</li>');
			optionalAttributes.append(optionalAttribute);
			if (data[name]) {
				var attribute = attr.type === 'expression' ?
					Simulators.expressionAttributeForInput(dataElementId + '-' + name, name, attr.label, data[name], false, attr.placeholder) :
					Simulators.simpleAttributeForInput(dataElementId + '-' + name, attr.type, name, attr.label, data[name], false, attr.placeholder);
				requiredAttributes.append(attribute);
				optionalAttribute.hide();
			} 
		});
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="panel panel-default description-panel" id="' + dataElementId + '-description-panel"><div class="panel-heading">' + Translator.trans('Description') + '</div><div class="panel-body"><textarea rows="5" name="' + dataElementId + '-description" id="' + dataElementId + '-description" wrap="hard" class="form-control data-description">' + data.description + '</textarea></div></div>');
		var dataButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + dataElementId + '-buttons-panel"></div>');
		var dataButtonsBody = $('<div class="panel-body data-buttons"></div>');
		dataButtonsBody.append('<button class="btn btn-success pull-right validate-edit-data">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		dataButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-data">' + Translator.trans('Cancel') + '</span></button>');
		dataButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		dataButtonsPanel.append(dataButtonsBody);
		dataPanelBody.append(dataButtonsPanel);
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.drawDatagroupForDisplay = function(datagroup) {
		var dataElementId = 'datagroup-' + datagroup.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'panel panel-success' });
		dataPanel.append('<div class="panel-heading" role="tab" id="' + dataElementId + '-panel"><button class="btn btn-success pull-right update-button delete-datagroup" data-parent="#' + dataElementId + '">' + Translator.trans('Delete') + ' <span class="glyphicon glyphicon-minus-sign"></span></button><button class="btn btn-success pull-right update-button add-data" data-parent="#' + dataElementId + '">' + Translator.trans('Add data') + ' <span class="glyphicon glyphicon-plus-sign"></span></button><button class="btn btn-success pull-right update-button edit-datagroup" data-parent="#' + dataElementId + '">' + Translator.trans('Edit datagroup') + ' <span class="glyphicon glyphicon-pencil"></span></button><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">' + Translator.trans('Group') + ' ' + datagroup.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="panel-body"></div>');
		var dataContainer = $('<div class="panel panel-default data-container datagroup" id="' + dataElementId + '-attributes-panel" data-id="' + datagroup.id + '"></div>');
		var dataContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'name', Translator.trans('Group Name'), datagroup.name, true, Translator.trans('Group Name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'label', Translator.trans('Group Label'), datagroup.label, true, Translator.trans('Group Label')));
		attributesContainer.append(requiredAttributes);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="panel panel-default description-panel" id="' + dataElementId + '-description-panel"><div class="panel-heading">' + Translator.trans('Description') + '</div><div class="panel-body datagroup-description rich-text">' + datagroup.description + '</div></div>');
		dataPanelBody.append('<div class="panel panel-default datas-panel" id="' + dataElementId + '-datas-panel"><div class="panel-body sortable"></div></div>');
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.drawDatagroupForInput = function(datagroup) {
		var dataElementId = 'datagroup-' + datagroup.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'panel panel-success' });
		dataPanel.append('<div class="panel-heading" role="tab" id="' + dataElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">' + Translator.trans('Group') + ' ' + datagroup.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="panel-body"></div>');
		var dataContainer = $('<div class="panel panel-default data-container datagroup" id="' + dataElementId + '-attributes-panel" data-id="' + datagroup.id + '"></div>');
		var dataContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append('<div class="form-group col-sm-12"><label for="' + dataElementId + '-name" class="col-sm-2 control-label">' + Translator.trans('Group Name') + '</label><div class="col-sm-10"><input type="text" name="' + dataElementId + '-name" id="' + dataElementId + '-name" data-attribute="name" class="form-control simple-value" placeholder="' + Translator.trans('Group name without spaces or special characters') + '" value="' + datagroup.name + '" /></div></div>');
		requiredAttributes.append('<div class="form-group col-sm-12"><label for="' + dataElementId + '-label" class="col-sm-2 control-label">' + Translator.trans('Group Label') + '</label><div class="col-sm-10"><input type="text" name="' + dataElementId + '-label" id="' + dataElementId + '-label" data-attribute="label" class="form-control simple-value" placeholder="' + Translator.trans('Group label') + '" value="' + datagroup.label + '" /></div></div>');
		attributesContainer.append(requiredAttributes);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="panel panel-default description-panel" id="' + dataElementId + '-description-panel"><div class="panel-heading">' + Translator.trans('Description') + '</div><div class="panel-body"><textarea rows="5" name="' + dataElementId + '-description" id="' + dataElementId + '-description" wrap="hard" class="form-control datagroup-description">' + datagroup.description + '</textarea></div></div>');
		var dataButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + dataElementId + '-buttons-panel"></div>');
		var dataButtonsBody = $('<div class="panel-body datagroup-buttons"></div>');
		dataButtonsBody.append('<button class="btn btn-success pull-right validate-edit-datagroup">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		dataButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-datagroup">' + Translator.trans('Cancel') + '</span></button>');
		dataButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		dataButtonsPanel.append(dataButtonsBody);
		dataPanelBody.append(dataButtonsPanel);
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.checkData = function(dataContainer) {
		var dataElementId = dataContainer.attr('id');
		var dataName = $.trim($('#' + dataElementId + '-name').val());
		if (dataName === '') {
			dataContainer.find('.error-message').text(Translator.trans('The data name is required'));
			dataContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(dataName)) {
			dataContainer.find('.error-message').text(Translator.trans('Incorrect data name'));
			dataContainer.find('.alert').show();
			return false;
		}
		if ($.trim($('#' + dataElementId + '-label').val()) === '') {
			dataContainer.find('.error-message').text(Translator.trans('The data label is required'));
			dataContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addData = function(dataContainerGroup) {
		try {
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var data = {
				id: Simulators.maxDatasetId() + 1, 
				name: '',
				label: '',
				description: ''
			};
			var dataPanelContainer = Simulators.drawDataForInput(data);
			dataPanelContainer.find('button.cancel-edit-data').addClass('cancel-add-data').removeClass('cancel-edit-data');
			dataPanelContainer.find('button.validate-edit-data').addClass('validate-add-data').removeClass('validate-edit-data');
			var datasPanel;
			var parentId = dataContainerGroup.attr('id');
			if (parentId === 'datas') {
				datasPanel = $("#collapsedatas").find("> div.sortable");
			} else {
				datasPanel = dataContainerGroup.find(".datas-panel > div.sortable");
			}
			datasPanel.append(dataPanelContainer);
			Simulators.bindData(dataPanelContainer);
			dataContainerGroup.find('a[data-toggle="collapse"]').each(function() {
				var objectID=$(this).attr('href');
				if($(objectID).hasClass('in')===false) {
					$(objectID).collapse('show');
				}
			});
			$("html, body").animate({ scrollTop: dataPanelContainer.offset().top }, 500);
			Simulators.updating = true;
		} catch (e) {
			console.log(e.message);
		}
	}

	Simulators.editData = function(dataContainerGroup) {
		try {
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var dataContainer = dataContainerGroup.find('.data-container, .datagroup-data-container');
			var attributesContainer = dataContainer.find('.attributes-container');
			var data = {
				id: dataContainer.attr('data-id'), 
				name: attributesContainer.find("p[data-attribute='name']").attr('data-value'),
				label: attributesContainer.find("p[data-attribute='label']").attr('data-value'),
				type: attributesContainer.find("p[data-attribute='type']").attr('data-value'),
				description: dataContainerGroup.find('.data-description').html()
			};
			$.each(Simulators.optionalAttributes, function (name, attr) {
				var oattr = attributesContainer.find("p[data-attribute='" + name + "'], span[data-attribute='" + name + "']");
				if (oattr.length > 0) {
					data[name] = oattr.attr('data-value');
				}
			});
			var dataPanelContainer = Simulators.drawDataForInput(data);
			if (data.type === 'choice') {
				var choicesPanel = Simulators.drawChoicesForInput(data.id);
				var choiceContainers = dataContainerGroup.find('div.choice-container');
				if (choiceContainers.length > 0) {
					choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
					choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
					choiceContainers.each(function(c) {
						var choice = {
							id : $(this).attr('data-id'),
							dataId: data.id,
							value: $(this).find("p[data-attribute='value']").attr('data-value'),
							label: $(this).find("p[data-attribute='label']").attr('data-value')
						};
						var choicePanel = Simulators.drawChoiceForInput(choice);
						choicesPanel.find('> .panel-body').append(choicePanel);
						Simulators.bindChoice(choicePanel);
					});
				} else {
					var choiceSourceContainers = dataContainerGroup.find('div.choice-source-container');
					if (choiceSourceContainers.length > 0) {
						choicesPanel.find('button.delete-choice-source').addClass('update-button').show();
						choicesPanel.find('button.add-choice').removeClass('update-button').hide();
						choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
						var choiceSource = {
							id : choiceSourceContainers.eq(0).attr('data-id'),
							dataId: data.id,
							valueColumn: choiceSourceContainers.eq(0).find("p[data-attribute='valueColumn']").attr('data-value'),
							labelColumn: choiceSourceContainers.eq(0).find("p[data-attribute='labelColumn']").attr('data-value'),
							idColumn: choiceSourceContainers.eq(0).find("p[data-attribute='idColumn']").attr('data-value')
						};
						var choicePanel = Simulators.drawChoiceSourceForInput(choiceSource);
						choicesPanel.find('> .panel-body').append(choicePanel);
						Simulators.bindChoiceSource(choicePanel);
					}
				}
				dataPanelContainer.find('.description-panel').after(choicesPanel);
				Simulators.bindChoices(choicesPanel);
			}
			Simulators.dataBackup = dataContainerGroup.replaceWith(dataPanelContainer);
			Simulators.bindData(dataPanelContainer);
			dataPanelContainer.find('> .panel-heading a').click();
			$("html, body").animate({ scrollTop: dataPanelContainer.offset().top }, 500);
			Simulators.updating = true;
		} catch (e) {
			console.log(e.message);
		}
	}

	Simulators.deleteData = function(dataContainerGroup) {
		try {
			var dataContainer = dataContainerGroup.find('.data-container, .datagroup-data-container');
			var attributesContainer = dataContainer.find('.attributes-container');
			var dataLabel = attributesContainer.find("p[data-attribute='label']").attr('data-value');
			bootbox.confirm({
				title: Translator.trans('Deleting data'),
				message: Translator.trans("Are you sure you want to delete the data : %label%", { 'label': dataLabel }), 
				callback: function(confirmed) {
					if (confirmed) {
						var name = attributesContainer.find("p[data-attribute='name']").attr('data-value');
						delete Simulators.dataset[name];
						dataContainerGroup.remove();
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console.log(e.message);
		}
	}

	Simulators.checkDatagroup = function(datagroupContainer) {
		var datagroupElementId = datagroupContainer.attr('id');
		var datagroupName = $.trim($('#' + datagroupElementId + '-name').val());
		if (datagroupName === '') {
			datagroupContainer.find('.error-message').text(Translator.trans('The datagroup name is required'));
			datagroupContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(datagroupName)) {
			datagroupContainer.find('.error-message').text(Translator.trans('Incorrect datagroup name'));
			datagroupContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addDatagroup = function(dataContainerGroup) {
		try {
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var datagroup = {
				id: parseInt(Simulators.maxDatasetId()) + 1, 
				name: '',
				label: '',
				description: ''
			};
			var dataPanelContainer = Simulators.drawDatagroupForInput(datagroup);
			dataPanelContainer.find('button.cancel-edit-datagroup').addClass('cancel-add-datagroup').removeClass('cancel-edit-datagroup');
			dataPanelContainer.find('button.validate-edit-datagroup').addClass('validate-add-datagroup').removeClass('validate-edit-datagroup');
			var datasPanel;
			var parentId = dataContainerGroup.attr('id');
			if (parentId === 'datas') {
				datasPanel = $("#collapsedatas").find("> div.sortable");
			} else {
				datasPanel = dataContainerGroup.find(".datas-panel > div.sortable");
			}
	
			datasPanel.append(dataPanelContainer);
			Simulators.bindDatagroup(dataPanelContainer);
			dataContainerGroup.find('a[data-toggle="collapse"]').each(function() {
				var objectID=$(this).attr('href');
				if($(objectID).hasClass('in')===false) {
					$(objectID).collapse('show');
				}
			});
			$("html, body").animate({ scrollTop: dataPanelContainer.offset().top }, 500);
			Simulators.updating = true;
		} catch (e) {
			console.log(e.message);
		}
	}

	Simulators.editDatagroup = function(dataContainerGroup) {
		try {
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var dataContainer = dataContainerGroup.find('.data-container.datagroup');
			var attributesContainer = dataContainer.find('.attributes-container');
			var datagroup = {
				id: dataContainer.attr('data-id'), 
				name: attributesContainer.find("p[data-attribute='name']").attr('data-value'),
				label: attributesContainer.find("p[data-attribute='label']").attr('data-value'),
				description: dataContainerGroup.find('.datagroup-description').html()
			};
			var dataPanelContainer = Simulators.drawDatagroupForInput(datagroup);
			Simulators.datagroupBackup = dataContainerGroup.clone();
			dataContainer.replaceWith(dataPanelContainer.find('.data-container.datagroup'));
			dataContainerGroup.find('.description-panel').eq(0).replaceWith(dataPanelContainer.find('.description-panel').eq(0));
			dataContainerGroup.find('.description-panel').eq(0).after(dataPanelContainer.find('.buttons-panel'));
			Simulators.bindDatagroup(dataContainerGroup);
			dataContainerGroup.find('> .panel-heading a').click();
			$("html, body").animate({ scrollTop: dataContainerGroup.offset().top }, 500);
			Simulators.updating = true;
		} catch (e) {
			console.log(e.message);
		}
	}

	Simulators.deleteDatagroup = function(dataContainerGroup) {
		try {
			var dataContainer = dataContainerGroup.find('.data-container.datagroup');
			var attributesContainer = dataContainer.find('.attributes-container');
			var dataLabel = attributesContainer.find("p[data-attribute='label']").attr('data-value');
			bootbox.confirm({
				title: Translator.trans('Deleting datagroup'),
				message: Translator.trans("Are you sure you want to delete the data group : %label% ?", { 'label': dataLabel }), 
				callback: function(confirmed) {
					if (confirmed) {
						// TODO : update dataset to delete all data in this datagroup
						dataContainerGroup.remove();
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console.log(e.message);
		}
	}

	Simulators.collectDatas = function() {
		var datas = [];
		$('#datas .data-container').each(function(d) {
			if ($(this).hasClass('datagroup')) {
				var gdatas = [];
				$(this).parent().find('.datagroup-data-container').each(function(d) {
					var choices = [];
					$(this).parent().find('.choice-container').each(function(d) {
						choices.push({
							id:  $(this).attr('data-id'),
							value: $(this).find("p[data-attribute='value']").attr('data-value'),
							label: $(this).find("p[data-attribute='label']").attr('data-value'),
						});
					});
					var choicesource = {};
					$(this).parent().find('.choice-source-container').each(function(d) {
						choicesource = {
							id:  $(this).attr('data-id'),
							idColumn: $(this).find("p[data-attribute='idColumn']").attr('data-value'),
							valueColumn: $(this).find("p[data-attribute='valueColumn']").attr('data-value'),
							labelColumn: $(this).find("p[data-attribute='labelColumn']").attr('data-value')
						};
					});
					gdatas.push({
						element: 'data',
						id:  $(this).attr('data-id'),
						name: $(this).find("p[data-attribute='name']").attr('data-value'),
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
						type: $(this).find("p[data-attribute='type']").attr('data-value'),
						'default': $(this).find("span[data-attribute='default']").attr('data-value'),
						min: $(this).find("span[data-attribute='min']").attr('data-value'),
						max: $(this).find("span[data-attribute='max']").attr('data-value'),
						content: $(this).find("span[data-attribute='content']").attr('data-value'),
						round: $(this).find("p[data-attribute='round']").attr('data-value'),
						unit: $(this).find("p[data-attribute='unit']").attr('data-value'),
						source: $(this).find("span[data-attribute='source']").attr('data-value'),
						index: $(this).find("span[data-attribute='index']").attr('data-value'),
						memorize: $(this).find("input[data-attribute='memorize']").is(':checked') ? 1 : 0,
						description: $(this).parent().find(".data-description").html(),
						choices: choices,
						choicesource: choicesource
					});
				});
				datas.push({
					element: 'datagroup',
					id:  $(this).attr('data-id'),
					name: $(this).find("p[data-attribute='name']").attr('data-value'),
					label: $(this).find("p[data-attribute='label']").attr('data-value'),
					description: $(this).parent().find(".datagroup-description").html(),
					datas: gdatas
				});
			} else {
				var choices = [];
				$(this).parent().find('.choice-container').each(function(d) {
					choices.push({
						id:  $(this).attr('data-id'),
						value: $(this).find("p[data-attribute='value']").attr('data-value'),
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
					});
				});
				var choicesource = {};
				$(this).parent().find('.choice-source-container').each(function(d) {
					choicesource = {
						id:  $(this).attr('data-id'),
						idColumn: $(this).find("p[data-attribute='idColumn']").attr('data-value'),
						valueColumn: $(this).find("p[data-attribute='valueColumn']").attr('data-value'),
						labelColumn: $(this).find("p[data-attribute='labelColumn']").attr('data-value')
					};
				});
				datas.push({
					element: 'data',
					id:  $(this).attr('data-id'),
					name: $(this).find("p[data-attribute='name']").attr('data-value'),
					label: $(this).find("p[data-attribute='label']").attr('data-value'),
					type: $(this).find("p[data-attribute='type']").attr('data-value'),
					'default': $(this).find("span[data-attribute='default']").attr('data-value'),
					min: $(this).find("span[data-attribute='min']").attr('data-value'),
					max: $(this).find("span[data-attribute='max']").attr('data-value'),
					content: $(this).find("span[data-attribute='content']").attr('data-value'),
					round: $(this).find("p[data-attribute='round']").attr('data-value'),
					unit: $(this).find("p[data-attribute='unit']").attr('data-value'),
					source: $(this).find("span[data-attribute='source']").attr('data-value'),
					index: $(this).find("span[data-attribute='index']").attr('data-value'),
					memorize: $(this).find("input[data-attribute='memorize']").is(':checked') ? 1 : 0,
					description: $(this).parent().find(".data-description").html(),
					choices: choices,
					choicesource: choicesource
				});
			}
		});
		return datas;
	}

}(this));
