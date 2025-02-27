{
  /* <Card */
}
{
  /*   title={ */
}
{
  /*     <div class="flex flex-row justify-between"> */
}
{
  /*       <div>Budget Overview</div> */
}
{
  /*       <div>{selectedMonth().format("MMMM YYYY")}</div> */
}
{
  /*     </div> */
}
{
  /*   } */
}
{
  /* > */
}
{
  /*   <Suspense fallback={<div>Loading...</div>}> */
}
{
  /*     <Show when={categoryBreakdown()?.length === 0}> */
}
{
  /*       <div class="font-thin text-neutral-content">No entries yet</div> */
}
{
  /*     </Show> */
}
{
  /*     <For each={categoryBreakdown()}> */
}
{
  /*       {(category) => ( */
}
{
  /*         <> */
}
{
  /*           <div class="flex flex-row justify-between"> */
}
{
  /*             <Label>{category.name}</Label> */
}
{
  /*             <Label>{formatMoney(category.total)}</Label> */
}
{
  /*           </div> */
}
{
  /*           <progress class="progress" value="50" max="100"></progress> */
}
{
  /*         </> */
}
{
  /*       )} */
}
{
  /*     </For> */
}
{
  /*   </Suspense> */
}
{
  /*   <Button class="mt-4" type="neutral" label="View all categories" /> */
}
{
  /* </Card> */
}
