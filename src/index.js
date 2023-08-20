
import { useLayout, useElement, useEffect, useApp} from '@nebula.js/stardust';
import properties from './object-properties';
import data from './data';
import ext from './ext';
import 'bootstrap/dist/css/bootstrap.css'
export default function supernova(galaxy) {
  return {
    qae: {
      properties,
      data,
    },
    ext: ext(galaxy),
    component() {
      const element = useElement();
      const layout = useLayout();
      const app = useApp();
      const sheetObj =[];
      
      // const [selected, setSelected] = useState([element,layout]);
      async function buildData() {
          //first will will need to get sheet list in array
          console.log();
          let sheetList = await app.getAllInfos().then(value => value.filter((x)=> x.qType === 'sheet'));
          const sheetListPromises =  sheetList.map(sheet=> app.getObject(sheet.qId));
          const sheetListObj = await Promise.all(sheetListPromises);
          const sheetListLayoutPromise =  sheetListObj.map(sheetObj => sheetObj.getLayout());
          const sheetListLayout = await Promise.all(sheetListLayoutPromise);
          console.log(sheetListLayout);
          sheetListLayout.map(layout=> {
            layout.qChildList.qItems.map(arr => {
              let qtitle;
              if (arr.qInfo.qType !== 'MCD') {
                if(arr.qData.title) { qtitle = arr.qData.title}else{ qtitle = arr.qInfo.qId}
                sheetObj.push({
                              qId:arr.qInfo.qId,
                              qTitle: qtitle,
                              qType:arr.qInfo.qType,
                              sheet:layout.qMeta.title,
                              published:layout.qMeta.published,
                              selected:true
                })
              }
            })
          })
          sheetObj.sort((a, b) => a.sheet.localeCompare(b.sheet));                                                                                             
           return sheetObj;                                                                                          
        }   
        
        async function renderTable() { 
          if (layout.qSelectionInfo.qInSelections) {
            // skip rendering when in selection mode
            return;
          }
          element.innerHTML ="";
          let getBasePath = function () {
            var prefix = window.location.pathname.substr(
                0,
                window.location.pathname.toLowerCase().lastIndexOf("/sense") + 1
              ),
              url = window.location.href;
            return (
              (url = url.split("/")),
              url[0] +
                "//" +
                url[2] +
                ("/" === prefix[prefix.length - 1]
                  ? prefix.substr(0, prefix.length - 1)
                  : prefix)
            );
          };
          let exportData = function (arr) {
            
            arr.forEach(function (object) {
              app.getObject(object).then((model) => {
                model
                  .exportData(
                    "OOXML",
                    "/qHyperCubeDef",
                    "" 
                  )
                  .then(function (retVal) {
                    var qUrl = retVal.result ? retVal.result.qUrl : retVal.qUrl;
                    var link = getBasePath() + qUrl;
                    window.open(link);
                  })
                  .catch(function (err) {
                    console.log(err);
                  })
                  .finally(function () {
                    console.log("exported");
                  });
              });
            });
          };

          const togglePublishedButton = document.createElement('button');
                  togglePublishedButton.textContent = 'Toggle Published';
                  togglePublishedButton.classList.add('btn', 'btn-secondary'); // Add the class
                  togglePublishedButton.style.marginRight = '2px'; 
                  let publishedVisible = true; // Track the visibility state

                  togglePublishedButton.addEventListener('click', () => {
                    const tableBody = element.querySelector('tbody');
                    sheetObj.forEach(row => {
                      const rowElement = tableBody.querySelector(`tr[data-qid="${row.qId}"]`); // Use attribute selector
                      if (rowElement) {
                        if (row.published) {
                          rowElement.style.display = ''; // Always show unpublished rows
                        } else {
                          rowElement.style.display = publishedVisible ? 'none' : ''; // Toggle visibility of published rows
                        }
                      }
                    });

                    // Toggle the visibility state
                    publishedVisible = !publishedVisible;
                  });
                  const exportbutton = document.createElement('button');
                          exportbutton.textContent = 'Export';
                          exportbutton.classList.add('btn', 'btn-success');
                          exportbutton.style.marginLeft = '5px'; 
                          exportbutton.addEventListener('click', () => {
                              const exportID = [];
                              checkboxes.forEach(checkbox => {
                                  const correspondingRow = sheetObj.find(row => row.qId === checkbox.id);
                                  if (correspondingRow && checkbox.checked) {
                                      const rowElement = element.querySelector(`tr[data-qid="${correspondingRow.qId}"]`);
                                      if (rowElement && rowElement.style.display !== 'none') {
                                          exportID.push(correspondingRow.qId);
                                      }
                                  }
                              });
                                console.log(exportID);
                                exportData(exportID);
                          });

                const hideTypeButton = document.createElement('button');
                hideTypeButton.textContent = 'Toggle Non-Tables';
                hideTypeButton.classList.add('btn', 'btn-secondary');
                hideTypeButton.style.marginRight = '2px'; 
            
                let hideType = false; // Track the hide state
            
                hideTypeButton.addEventListener('click', () => {
                    const tableBody = element.querySelector('tbody');
                    if (hideType) {
                        // Show all rows when filter is already applied
                        sheetObj.forEach(row => {
                            const rowElement = tableBody.querySelector(`tr[data-qid="${row.qId}"]`);
                            if (rowElement) {
                                rowElement.style.display = '';
                            }
                        });
                        hideType = false;
                    } else {
                        // Apply filter to hide rows other than 'table' and 'kpi'
                        sheetObj.forEach(row => {
                            const rowElement = tableBody.querySelector(`tr[data-qid="${row.qId}"]`);
                            if (rowElement && (row.qType !== 'table' && row.qType !== 'pivot-table')) {
                                rowElement.style.display = 'none';
                            }
                        });
                        hideType = true;
                    }
                });

                const toggleAllButton = document.createElement('button');
                toggleAllButton.textContent = 'Toggle All';
                toggleAllButton.classList.add('btn', 'btn-secondary');
                toggleAllButton.style.marginRight = '2px'; 
                toggleAllButton.addEventListener('click', () => {
                  checkboxes.forEach(checkbox => {
                    const correspondingRow = sheetObj.find(row => row.qId === checkbox.id);
                    if (correspondingRow) {
                      checkbox.checked = !checkbox.checked;
                      correspondingRow.selected = checkbox.checked;
                    }
                  });
                });
              

          const buttonContainer = document.createElement('div');
          buttonContainer.appendChild(toggleAllButton);
          buttonContainer.appendChild(togglePublishedButton); 
          buttonContainer.appendChild(hideTypeButton);
          buttonContainer.appendChild(exportbutton);
          const tableContainer = document.createElement('div');
          tableContainer.style.overflowX = 'auto'; // Enable horizontal scrolling if necessary
tableContainer.style.maxHeight = '90%'; 
          element.appendChild(buttonContainer);
          element.appendChild(tableContainer);
          const header = `<thead><th scope="col">Selected</th>
                          <th scope="col"> Title</th>
                          <th scope="col"> Sheet</th>
                          <th scope="col"> Type</th>
                          <th  scope="col"> Published</th></tr>
                        </thead>`;
            const sheetArray = await buildData()
            // const rows = sheetArray
            //         .map((row) => `<tr id=${row.qId} ><td><input class="form-check-input"
            //                        type="checkbox" value=${row.selected} id=${row.qId} ></td>
            //                           <td>${row.qId}</td>
            //                           <td>${row.qType}</td>
            //                           <td>${row.published}</td>
            //                       </tr>`).join(''); 
            const rows = sheetArray
                            .map((row) => `<tr data-qid="${row.qId}">
                              <td><input 
                                type="checkbox" value=${row.selected} id=${row.qId}></td>
                              <td>${row.qTitle}</td>
                              <td>${row.sheet}</td>
                              <td>${row.qType}</td>
                              <td>${row.published}</td>
                            </tr>`).join('');
            const table = `<table class="table">${header}<tbody>${rows}</tbody></table>`;
            tableContainer.innerHTML = table;
          
        const checkboxes = element.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          const correspondingRow = sheetObj.find(row => row.qId === checkbox.id);
          if (correspondingRow) {
            checkbox.addEventListener('click', () => {
              // Update the selected value in sheetObj
              correspondingRow.selected = checkbox.checked;
             });
          }
        });
    
      }
        renderTable();
    },
    
  };
}
