
//Computational Module
var budgetController = (function() { 
    
    //Expense constructor
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage  = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0){
            this.percentage = Math.round((this.value /  totalIncome)*100);
        }else {
            this.percentage = -1;
        }
    }; 

    Expense.prototype.getPercentage =  function() {
        return this.percentage;

    }

    //Income constructor
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };


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

    //public functions
    return {
        //Create Items for Income & Expense
        addItem: function(type, des, val) {
            var newItem, ID;
            //Create new idea
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                ID = 0;
            }
            //Create new item
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push into data structure
            data.allItems[type].push(newItem);
            //Return the new element
            return newItem;
            
        },

        deleteItem: function(type, id) {

            var ids, index;
            // id = 3
            //data.allItems[type][id];

            ids = data.allItems[type].map(function(current) {
                return current.id ;  
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            //calculate total income & expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate percentage of income spent
            if(data.totals.inc > 0){
                data.percentage = Math.round(( data.totals.exp/ data.totals.inc )* 100);
            }else {
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            } 
        },
    }




})();





//UI Controls
var UIController = (function() {
    //HTML Class Repository
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num,type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3) {
            int = int.substr(0, int.length-3) + ',' +int.substr(int.length - 3 ,3);
        }

        dec = numSplit[1];
        return (type  === 'exp' ? '-' : '+') +' ' + int + '.' +dec;
    };

    
    var nodeListForEach = function(list, callback){
        for(var i = 0; i< list.length; i++){
            callback(list[i], i);
        }
    };

    
    return {
        //Input field getter
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
            };
        },

        addListItem: function(obj, type){
            var html, newHtml, element;
            //Create HTML string with placeholder text
            if(type=== 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            
            //Replace placeholder with actual data
            newHtml = html.replace('%id', obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
            
            //Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        //Clearing the input field
        clearFields: function() {
            var fields = document.querySelectorAll(DOMstrings.inputDescription +', ' +DOMstrings.inputValue);
            
            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current,index,array) {
                current.value = "";                
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
        
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        
        
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){

                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
                
            });

        },

        displayMonth: function(){
            var now, year, month, months;
            now = new Date();
            
            months = ['January','February','March','April','May','June','July','August','September','October','November','December']
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent  = months[month + 1] + ' ' +year;


        },

        changedType: function() {
             var fields = document.querySelectorAll(
                 DOMstrings.inputType +',' +
                 DOMstrings.inputDescription +',' +
                 DOMstrings.inputValue
             );

            nodeListForEach( fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        //HTML Class Getter
        getDOMstrings: function(){
            return DOMstrings;
        }

    };
})();







//Global App Controller
var controller = (function(budgetCtrl, UICtrl) {
    
    var  setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    
    };

    var updatePercentages = function() {

        //Calculate the percentage
        budgetCtrl.calculatePercentages();

        //Read the percentage from controller
        var percentages = budgetCtrl.getPercentages();

        //Update UI
        UICtrl.displayPercentages(percentages);

    };

    var updateBudget = function(){
        //Calculate Budget
        budgetCtrl.calculateBudget();

        //Return the Budget
        var budget = budgetCtrl.getBudget();

        //Display Budget on the UI
        UICtrl.displayBudget(budget);

    };
    

    var ctrlAddItem = function() {
        var input, newItem

        //Get Input data
        input = UICtrl.getInput();

        //Checking for valid inputs in the fields
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            //Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //Add Item to UI
            UICtrl.addListItem(newItem, input.type);
            //Clear the fields
            UICtrl.clearFields();
            //Calculate and Update Budget
            updateBudget();
            //update percentages
            updatePercentages();

        }else {
            alert("Enter Valid input in the fields");
        }



    };


    var ctrlDeleteItem =  function(event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            //inc - 1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete item from the structure
            budgetCtrl.deleteItem(type, ID);

            //delete item from the UI
            UICtrl.deleteListItem(itemID);

            //Update new budget
            updateBudget();

            //update percentages
            updatePercentages();




        }

    };

    return{
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

    

})(budgetController, UIController);

controller.init();