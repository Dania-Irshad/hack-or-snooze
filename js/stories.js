"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  //console.debug("generateStoryMarkup", story);
  const checkLogin = Boolean(currentUser);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${checkLogin ? getHeartHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Make favorite/not-favorite heart for story */

function getHeartHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const heartType = isFavorite ? "fas" : "far";
  return `
      <span class="heart">
        <i class="${heartType} fa-heart"></i>
      </span>`;
}

/** Toggle favorites on click on heart & add or remove favorite story */
async function toggleFavorites(evt) {
  console.debug("toggleFavorites");
  const $targetHeart = $(evt.target).closest("i");
  const $targetStory = $(evt.target).closest("li");
  const $targetStoryId = $targetStory.attr("id");
  const story = storyList.stories.find(s => s.storyId === $targetStoryId);
  if ($targetHeart.hasClass("far"))
  {
    await currentUser.addOrRemoveFavorites(story);
    $targetHeart.toggleClass("far fas");
  }
  else
  {
    await currentUser.addOrRemoveFavorites(story);
    $targetHeart.toggleClass("far fas");
  }
}

$allStoriesList.on("click", ".heart", toggleFavorites);

/** Gets list of favorites from server, generates their HTML, and puts on page. */

function putFavStoriesOnPage() {
  console.debug("putFavStoriesOnPage");
  $allFavoritesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allFavoritesList.append($story);
  }

  $allFavoritesList.show();

}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Gets new story from form and adds to the page */

async function addStoryOnPage(evt) {
  evt.preventDefault();
  console.debug("addStoryOnPage");

  let title = $("#story-title").val();
  let author = $("#story-author").val();
  let url = $("#story-url").val();
  let story = await storyList.addStory(currentUser, {title, author, url});
  let $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $newStoryForm.trigger("reset");
}

$newStoryForm.on("submit", addStoryOnPage);

/** Generate HTML of user added stories */

function generateMyStoryMarkup(story) {
  //console.debug("generateMyStoryMarkup", story);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="trash">
          <i class="fas fa-trash-alt"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Put current user added stories on page */

function putAddedStoriesOnPage() {
  console.debug("putAddedStoriesOnPage");
  $myStoriesList.empty();

  // loop through all of user added stories and generate HTML for them
  for (let story of currentUser.ownStories) {
    const $story = generateMyStoryMarkup(story);
    $myStoriesList.append($story);
  }

  $myStoriesList.show();
}

async function deleteStoryOnClick(evt)
{
  console.debug("deleteStoryOnClick");
  const $targetStory = $(evt.target).closest("li");
  const $targetStoryId = $targetStory.attr("id");
  const story = storyList.stories.find(s => s.storyId === $targetStoryId);
  await storyList.deleteStory(currentUser, story);
  putAddedStoriesOnPage();
}

$myStoriesList.on("click", ".trash", deleteStoryOnClick);