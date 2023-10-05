
import { useLayout, useElement, useApp} from '@nebula.js/stardust';
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
      let selectAllToggle = true;
      let storedData
      
      function saveCheckboxStates() {
        const checkboxStates = {};
        const checkboxes = element.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
          checkboxStates[checkbox.id] = checkbox.checked;
        });
         localStorage.setItem('checkboxStates', JSON.stringify(checkboxStates));
      }

      async function buildData() {
       
        if(localStorage.getItem('checkboxStates')){
           storedData = await JSON.parse(localStorage.getItem('checkboxStates'));
        }else{
           storedData= false;
        }
          let sheetList = await app.getAllInfos().then(value => value.filter((x)=> x.qType === 'sheet'));
          const sheetListPromises =  sheetList.map(sheet=> app.getObject(sheet.qId));
          const sheetListObj = await Promise.all(sheetListPromises);
          const sheetListLayoutPromise =  sheetListObj.map(sheetObj => sheetObj.getLayout());
          const sheetListLayout = await Promise.all(sheetListLayoutPromise);
          for (const layout of sheetListLayout) {
            for (const arr of layout.qChildList.qItems) {
              let qtitle;
              if (arr.qInfo.qType !== 'MCD' && arr.qInfo.qType !== 'container' && (arr.qInfo.qType === 'barchart'|| arr.qInfo.qType === 'boxplot' || arr.qInfo.qType === 'bulletchart'
              || arr.qInfo.qType === 'combochart' || arr.qInfo.qType === 'distributionplot' || arr.qInfo.qType === 'gauge' || arr.qInfo.qType === 'histogram' || arr.qInfo.qType === 'linechart'
              || arr.qInfo.qType === 'mekkochart' || arr.qInfo.qType === 'piechart'  || arr.qInfo.qType === 'pivot-table'  || arr.qInfo.qType === 'scatterplot'  || arr.qInfo.qType === 'table'
              || arr.qInfo.qType === 'text-image' || arr.qInfo.qType === 'treemap' || arr.qInfo.qType === 'waterfallchart')) {
                
                if(arr.qData.title) { qtitle = arr.qData.title}else{ qtitle = arr.qInfo.qId}
                if(storedData.hasOwnProperty(arr.qInfo.qId)){
                  sheetObj.push({
                    qId:arr.qInfo.qId,
                    qTitle:qtitle,
                    qType:arr.qInfo.qType,
                    sheet:layout.qMeta.title,
                    published:layout.qMeta.published,
                    selected:storedData[arr.qInfo.qId]?"checked":false
                    })
                }else{
                  sheetObj.push({
                    qId:arr.qInfo.qId,
                    qTitle:qtitle,
                    qType:arr.qInfo.qType,
                    sheet:layout.qMeta.title,
                    published:layout.qMeta.published,
                    selected:false
                    })
                }
              }else if (arr.qInfo.qType === 'container') {
                await findContainer(arr,layout);
            }        
          }}
            
          sheetObj.sort((a, b) => a.sheet.localeCompare(b.sheet));                                                                
           return sheetObj;                                                                                          
        }   

        async function findContainer(arr,layout) {
          const container = await app.getObject(arr.qInfo.qId);
          const childInfos = await container.getChildInfos();
          const containerObjPromises = childInfos.map(child => app.getObject(child.qId).then(obj => obj.getLayout()));
          const containerObjLayouts = await Promise.all(containerObjPromises);
  
          for (const containerLayout of containerObjLayouts) {
              let qtitle;
  
              if (containerLayout.title) {
                  qtitle = containerLayout.title;
              } else {
                  qtitle = containerLayout.qInfo.qId;
              }
              if( arr.qInfo.qType !== 'MCD' && arr.qInfo.qType !== 'container' && (arr.qInfo.qType === 'barchart'|| arr.qInfo.qType === 'boxplot' || arr.qInfo.qType === 'bulletchart'
              || arr.qInfo.qType === 'combochart' || arr.qInfo.qType === 'distributionplot' || arr.qInfo.qType === 'gauge' || arr.qInfo.qType === 'histogram' || arr.qInfo.qType === 'linechart'
              || arr.qInfo.qType === 'mekkochart' || arr.qInfo.qType === 'piechart'  || arr.qInfo.qType === 'pivot-table'  || arr.qInfo.qType === 'scatterplot'  || arr.qInfo.qType === 'table'
              || arr.qInfo.qType === 'text-image' || arr.qInfo.qType === 'treemap' || arr.qInfo.qType === 'waterfallchart')){
                if (storedData.hasOwnProperty(containerLayout.qInfo.qId)) {
                    sheetObj.push({
                        qId: containerLayout.qInfo.qId,
                        qTitle: qtitle,
                        qType: "container " + containerLayout.qInfo.qType,
                        sheet: layout.qMeta.title,
                        published: layout.qMeta.published,
                        selected: storedData[containerLayout.qInfo.qId] ? "checked" : false
                    });
                } else {
                    sheetObj.push({
                        qId: containerLayout.qInfo.qId,
                        qTitle: qtitle,
                        qType: "container " + containerLayout.qInfo.qType,
                        sheet: layout.qMeta.title,
                        published: layout.qMeta.published,
                        selected: false
                    });
                }
              }
          }
      }

        async function renderTable() { 
          if (layout.qSelectionInfo.qInSelections) {
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
          let exportData =  function (arr) {
            
            arr.forEach(function (object) {
              console.log(object);
              app.getObject(object.qId).then((model) => {
                model
                  .exportData(
                    "OOXML",
                    "/qHyperCubeDef",
                    "" 
                  )
                  .then(async function (retVal) {
                    var qUrl = retVal.result ? retVal.result.qUrl : retVal.qUrl;
                    var link = getBasePath() + qUrl;
                  const response = await fetch(link);
                  const blob = await response.blob();
                  const newBlob = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  //  newBlob.download  = 'custom_filename.xlsx';
                  const newBlobUrl = URL.createObjectURL(newBlob);
                  const downloadLink = document.createElement('a');
                  downloadLink.href = newBlobUrl;
                  if (object.qTitle) {
                    downloadLink.download = object.qTitle+'.xlsx';
                  }else{
                    downloadLink.download = object.qId+'.xlsx';
                  }
                  downloadLink.click();
                  URL.revokeObjectURL(newBlobUrl);
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
          togglePublishedButton.classList.add('btn', 'btn-secondary');
          togglePublishedButton.style.marginRight = '2px'; 
          let publishedVisible = false; 
          togglePublishedButton.addEventListener('click', button1);


          const hideTypeButton = document.createElement('button');
          hideTypeButton.textContent = 'Toggle Non-Tables';
          hideTypeButton.classList.add('btn', 'btn-secondary');
          hideTypeButton.style.marginRight = '2px'; 
          let hideType = false;
          hideTypeButton.addEventListener('click', button2);

          function button1() {
            publishedVisible = !publishedVisible;
            if (publishedVisible) {
              togglePublishedButton.classList.add('btn-success'); 
              togglePublishedButton.classList.remove('btn-secondary');
            } else {
                togglePublishedButton.classList.remove('btn-success');
                togglePublishedButton.classList.add('btn-secondary'); 
            }
            buttonControl() 
          }
          function button2() {
            hideType = !hideType;
            if (hideType) {
              hideTypeButton.classList.add('btn-success');
              hideTypeButton.classList.remove('btn-secondary'); 
            } else {
              hideTypeButton.classList.remove('btn-success'); 
              hideTypeButton.classList.add('btn-secondary');
            }
            buttonControl() 
          }
          function buttonControl() {
              showAllRecords() 
              togglePublished()
              if(hideType){
                hideTypeFn()
              }
              
          }
          function showAllRecords() {
            const tableBody = element.querySelector('tbody');
            sheetObj.forEach(row => {
              const rowElement = tableBody.querySelector(`tr[data-qid="${row.qId}"]`);
              if (rowElement) {
                rowElement.style.display = '';
              }
            });
          }
          function togglePublished() {
            const tableBody = element.querySelector('tbody');
            sheetObj.forEach(row => {
              const rowElement = tableBody.querySelector(`tr[data-qid="${row.qId}"]`);
              if (rowElement) {
                if (row.published) {
                  rowElement.style.display = '';
                } else {
                  rowElement.style.display = publishedVisible ? 'none' : '';
                }
              }
            });
          }
          function hideTypeFn() {
            const tableBody = element.querySelector('tbody');
              if (!hideType) {
                  sheetObj.forEach(row => {
                      const rowElement = tableBody.querySelector(`tr[data-qid="${row.qId}"]`);
                      if (rowElement) {
                          rowElement.style.display = '';
                      }
                  });
                  // hideType = false;
              } else {
                  sheetObj.forEach(row => {
                      const rowElement = tableBody.querySelector(`tr[data-qid="${row.qId}"]`);
                      if (rowElement && (row.qType !== 'table' && row.qType !== 'pivot-table')) {
                          rowElement.style.display = 'none';
                      }
                  });
                  // hideType = true;
                }
          }
          
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
                            exportID.push(correspondingRow);
                        }
                    }
                  });
                  exportData(exportID);
                });
                 
          

            const toggleAllButton = document.createElement('button');
            toggleAllButton.textContent = 'Toggle All';
            toggleAllButton.classList.add('btn', 'btn-secondary');
            toggleAllButton.style.marginRight = '2px'; 
            toggleAllButton.addEventListener('click', () => {
              checkboxes.forEach(checkbox => {
                const correspondingRow = sheetObj.find(row => row.qId === checkbox.id);
                if (correspondingRow) {
                    checkbox.checked = selectAllToggle;
                    correspondingRow.selected = checkbox.checked;
                }
              });
              selectAllToggle = !selectAllToggle;
            });

          const buttonContainer = document.createElement('div');
          buttonContainer.appendChild(toggleAllButton);
          buttonContainer.appendChild(togglePublishedButton); 
          // buttonContainer.appendChild(hideTypeButton);
          buttonContainer.appendChild(exportbutton);
          
          const tableContainer = document.createElement('div');
          tableContainer.style.overflowX = 'auto'; 
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
          const rows = sheetArray
                            .map((row) => `<tr data-qid="${row.qId}">
                              <td><input class='form-check-input'
                              type="checkbox" value=${row.selected} id=${row.qId} ${row.selected}></td>
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
              saveCheckboxStates()
              correspondingRow.selected = checkbox.checked;
              
             });
          }
        });
      }
        renderTable();
    },
  };
}
