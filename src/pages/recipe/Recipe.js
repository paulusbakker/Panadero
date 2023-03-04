import React, { useEffect, useReducer } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { recipeBookAtom } from "../../atom/recipeBookAtom";
import { getRecipeFromRecipeName } from "../../helper/getRecipeFromRecipeName";
import { useRecoilValue } from "recoil";
import { flattenRecipe } from "../../helper/flattenRecipe";
import { calculateAmounts } from "../../helper/calculateAmounts";
import RecipeItem from "./components/RecipeItem";
import Symbol from "../../components/Symbol";
import EnterAmount from "./components/EnterAmount";
import RecipeItemCenter from "./components/RecipeItemCenter";
import RecipeItemTotal from "./components/RecipeItemTotal";
import RecipeItemCost from "./components/RecipeItemCost";
import { calculateTotalLiquidPercentage } from "../../helper/calculateTotalLiquidPercentage";
import { nativeTouchData } from "react-dom/test-utils";

export const ACTIONS = {
  CALCULATE_AMOUNTS: "calculate_amounts",
  HANDLE_SUBMIT: "handle_submit",
  HANDLE_RECIPE_INDEX: "handle_Recipe_item_index",
  CANCEL_CALCULATE_AMOUNT: "cancel_calculate_amount",
};
export const VIEWMODE = {
  VIEW_RECIPE: "view_recipe",
  VIEW_AMOUNTS: "view_amounts",
  ENTER_AMOUNTS: "enter_amounts",
};
const reducer = (recipeState, action) => {
  switch (action.type) {
    case ACTIONS.HANDLE_SUBMIT:
      if (action.payload.weight === 0) return recipeState;
      const [calculatedRecipe, totalFLourWeight, totalLiquidWeight] =
        calculateAmounts(
          recipeState.recipe,
          action.payload.weight,
          recipeState.index
        );
      return {
        ...recipeState,
        recipe: calculatedRecipe,
        totalFlourWeight: totalFLourWeight,
        totalLiquidWeight: totalLiquidWeight,
        viewMode: VIEWMODE.VIEW_AMOUNTS,
      };
    case ACTIONS.HANDLE_RECIPE_INDEX:
      return {
        ...recipeState,
        viewMode: VIEWMODE.ENTER_AMOUNTS,
        index: action.payload.index,
      };
    case ACTIONS.CANCEL_CALCULATE_AMOUNT:
      return { ...recipeState, viewMode: VIEWMODE.VIEW_RECIPE };
    default:
      return recipeState;
  }
};

function Recipe() {
  const navigate = useNavigate();
  const location = useLocation();
  let recipeName =
    location.state && location.state.recipeName
      ? location.state.recipeName
      : null;

  // redirect non-existing url's
  useEffect(() => {
    if (!recipeName) navigate("/recipes", { replace: true });
  }, []);

  const recipeBook = useRecoilValue(recipeBookAtom);

  const initalState = {
    recipe: recipeName
      ? flattenRecipe(
          getRecipeFromRecipeName(recipeName, recipeBook),
          recipeBook
        )
      : null,
    index: null,
    currentWeight: 0,
    totalFlourWeight: 0,
    totalLiquidWeight: 0,
    viewMode: VIEWMODE.VIEW_RECIPE,
  };
  const [recipeState, dispatch] = useReducer(reducer, initalState);

  // if no recipeName, no output!
  if (!recipeName) return null;

  return (
    <>
      {recipeState.viewMode === VIEWMODE.ENTER_AMOUNTS && (
        <EnterAmount
          name={
            isNaN(recipeState.index) // index might be filled with for example 'Total flour'
              ? recipeState.index
              : recipeState.recipe[Math.abs(recipeState.index) + 1].name
          }
          dispatch={dispatch}
        />
      )}
      <div className="recipe">
        <div className="recipe-title">
          {recipeState.recipe[0].name}
          <Symbol type={"menu"} />
        </div>
        <ul className="recipe-list">
          {/*delete first element with slice because recipe title already printed*/}
          {recipeState.recipe.slice(1).map((recipeItem, index) => (
            <RecipeItem
              key={`recipe-item-${index}`}
              recipeItem={recipeItem}
              index={index}
              showInclusive={true}
              viewMode={recipeState.viewMode}
              dispatch={dispatch}
            />
          ))}
          <hr />
          {/*totals*/}
          <ul className="recipe-list">
            <RecipeItemTotal
              name={"total flour"}
              isRecipe={false}
              isFlour={true}
              isLiquid={false}
              totalLiquidPercentage={null}
              viewMode={recipeState.viewMode}
              dispatch={dispatch}
              weight={recipeState.totalFlourWeight}
            />
            <RecipeItemTotal
              name={"total liquid"}
              isRecipe={false}
              isFlour={false}
              isLiquid={true}
              totalLiquidPercentage={calculateTotalLiquidPercentage(
                recipeState.recipe
              )}
              viewMode={recipeState.viewMode}
              dispatch={dispatch}
              weight={recipeState.totalLiquidWeight}
            />
            <RecipeItemTotal
              name={"total recipe"}
              isRecipe={true}
              isFlour={false}
              isLiquid={false}
              totalLiquidPercentage={null}
              viewMode={recipeState.viewMode}
              dispatch={dispatch}
              weight={recipeState.recipe[0].weight}
            />
            {recipeState.viewMode === VIEWMODE.VIEW_AMOUNTS && (
              <button
                onClick={() =>
                  dispatch({ type: ACTIONS.CANCEL_CALCULATE_AMOUNT })
                }
              >
                C
              </button>
            )}
          </ul>
        </ul>
      </div>

      {/*Ingredients minus predoughs*/}
      {recipeState.recipe.some((recipeItem) => recipeItem.depth !== 0) && (
        <div className="recipe">
          <ul className="recipe-list">
            <RecipeItemCenter>Ingredients minus predoughs</RecipeItemCenter>
            {recipeState.recipe.slice(1).map((recipeItem, index) => {
              return (
                <RecipeItem
                  key={`recipe-item-${index}`}
                  recipeItem={recipeItem}
                  index={-index}
                  showInclusive={false}
                  viewMode={recipeState.viewMode}
                  dispatch={dispatch}
                />
              );
            })}
          </ul>
        </div>
      )}
      {/*costs*/}
      {recipeState.viewMode === VIEWMODE.VIEW_AMOUNTS && (
        <div className="recipe">
          <ul className="recipe-list">
            <RecipeItemCenter>Costs</RecipeItemCenter>
            {recipeState.recipe
              .slice(1)
              .map(
                (recipeItem, index) =>
                  recipeItem.depth === 0 && (
                    <RecipeItemCost
                      key={`recipe-item-${index}`}
                      recipeItem={recipeItem}
                      totalRecipe={false}
                    />
                  )
              )}
            <hr />
            <RecipeItemCost
              recipeItem={recipeState.recipe[0]}
              totalRecipe={true}
            />
          </ul>
        </div>
      )}
    </>
  );
}

export default Recipe;
