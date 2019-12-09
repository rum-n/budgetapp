
//budget controller
var budgetController = (function(){

  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  };

  var allExpenses = [];
  var allIncomes = [];
  var totalExpenses = 0;

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      };

      if (type === 'exp'){
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    calculateBudget: function() {
      //calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      //calculate the budget__title
      data.budget = data.totals.inc - data.totals.exp;
      //calculate % of income that we spent\
      if (data.totals.inc > 0) {
          data.percentage = (data.totals.exp / data.totals.inc) * 100
      } else {
        data.percentage = -1;
      }

    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

  };

})();


//ui controller
var uiController = (function(){

  var domStrings = {
    inputType: '.add__type',
    inputDesc: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expense__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: ".budget__expenses--value",
    percentageLabel: '.budget__expenses--percentage'
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(domStrings.inputType).value, // will be either inc or exp
        description: document.querySelector(domStrings.inputDesc).value,
        value: parseFloat(document.querySelector(domStrings.inputValue ).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      // create HTML string with placeholder text

      if (type === 'inc') {
          element = domStrings.incomeContainer;

          html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
          element = domStrings.expenseContainer;

          html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // replace placeholder text with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);

      // insert HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    clearFields: function(){
      var fields, fieldsArray;

      fields = document.querySelectorAll(domStrings.inputDesc + ', ' + domStrings.inputValue);

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(current, index, array){
        current.value = '';
      });

      fieldsArray[0].focus(); //bring focus back on description field (cursor)

    },

    displayBudget: function(obj) {
      document.querySelector(domStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(domStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(domStrings.expenseLabel).textContent = obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = '---';
      }
    },

    getDOMstrings: function(){
      return domStrings;
    }
  };
})();


//global app controller
var controller = (function(budgetCtrl, uiCtrl){

  var setupEventListeners = function() {
    var DOM = uiCtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event){
        if (event.keyCode === 13 || event.which === 13) {
          ctrlAddItem();
        }
    });
  };

  var updateBudget = function(){
    // 1. calculate budget
    budgetCtrl.calculateBudget();
    // 1.1 return budge
    var budget = budgetCtrl.getBudget();
    // 2. display budget on the UI
    uiCtrl.displayBudget(budget);
  };

  var ctrlAddItem = function () {
    var input, newItem;

    // 1. get filled input data
    input = uiCtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. add item to budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. add item to the ui
      uiCtrl.addListItem(newItem, input.type);
      // 4. clear the fields
      uiCtrl.clearFields();
      // 5. calculate and update budget
      updateBudget();
    }
  };

  return {
    init: function(){
      uiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };

})(budgetController, uiController);

controller.init();
