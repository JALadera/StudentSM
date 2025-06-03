$components = @(
    @{
        Path = "frontend/src/components/auth/LoginForm.vue"
        Content = @"
<template>
  <form class='space-y-4'>
    <input class='w-full p-2 rounded bg-[#222] text-white' placeholder='Username' />
    <input class='w-full p-2 rounded bg-[#222] text-white' placeholder='Password' type='password' />
    <button class='w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>Login</button>
  </form>
</template>
"@
    },
    @{
        Path = "frontend/src/components/auth/TeacherProfile.vue"
        Content = @"
<template>
  <div class='bg-[#222] p-6 rounded shadow text-white'>
    <h2 class='text-xl font-bold mb-2'>Teacher Profile</h2>
    <p>Name: [Teacher Name]</p>
    <p>Email: [teacher@email.com]</p>
    <!-- Add more profile fields as needed -->
  </div>
</template>
"@
    },
    @{
        Path = "frontend/src/components/students/StudentList.vue"
        Content = @"
<template>
  <div>
    <h3 class='text-lg font-bold mb-2'>Student List</h3>
    <ul>
      <li v-for='student in students' :key='student.id' class='mb-1'>
        {{ student.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
const students = [
  { id: 1, name: 'Juan Dela Cruz' },
  { id: 2, name: 'Maria Clara' }
]
</script>
"@
    },
    @{
        Path = "frontend/src/components/students/StudentDetail.vue"
        Content = @"
<template>
  <div>
    <h3 class='text-lg font-bold mb-2'>Student Detail</h3>
    <p>Name: Juan Dela Cruz</p>
    <p>Email: juan@email.com</p>
    <!-- Add more details as needed -->
  </div>
</template>
"@
    },
    @{
        Path = "frontend/src/components/grades/GradeTable.vue"
        Content = @"
<template>
  <div>
    <h3 class='text-lg font-bold mb-2'>Grade Book</h3>
    <table class='min-w-full bg-[#222] text-white rounded'>
      <thead>
        <tr>
          <th class='p-2'>Student</th>
          <th class='p-2'>Grade</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class='p-2'>Juan Dela Cruz</td>
          <td class='p-2'>95</td>
        </tr>
        <tr>
          <td class='p-2'>Maria Clara</td>
          <td class='p-2'>98</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
"@
    },
    @{
        Path = "frontend/src/components/grades/GradeForm.vue"
        Content = @"
<template>
  <form class='space-y-4'>
    <input class='w-full p-2 rounded bg-[#222] text-white' placeholder='Assessment Name' />
    <input class='w-full p-2 rounded bg-[#222] text-white' placeholder='Score' type='number' />
    <button class='w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>Submit</button>
  </form>
</template>
"@
    },
    @{
        Path = "frontend/src/components/common/NavBar.vue"
        Content = @"
<template>
  <nav class='bg-[#141414] text-white p-4 flex justify-between'>
    <div class='font-bold text-xl'>StudentMS</div>
    <div>
      <a href='/dashboard' class='mr-4 hover:text-red-600'>Dashboard</a>
      <a href='/students' class='mr-4 hover:text-red-600'>Students</a>
      <a href='/grades' class='hover:text-red-600'>Grades</a>
    </div>
  </nav>
</template>
"@
    },
    @{
        Path = "frontend/src/components/common/SideMenu.vue"
        Content = @"
<template>
  <aside class='bg-[#181818] text-white w-48 min-h-screen p-4'>
    <ul>
      <li><a href='/dashboard' class='block py-2 hover:text-red-600'>Dashboard</a></li>
      <li><a href='/students' class='block py-2 hover:text-red-600'>Students</a></li>
      <li><a href='/grades' class='block py-2 hover:text-red-600'>Grades</a></li>
    </ul>
  </aside>
</template>
"@
    },
    @{
        Path = "frontend/src/components/enrollment/EnrollmentForm.vue"
        Content = @"
<template>
  <form class='space-y-4'>
    <input class='w-full p-2 rounded bg-[#222] text-white' placeholder='Student ID' />
    <input class='w-full p-2 rounded bg-[#222] text-white' placeholder='Section' />
    <button class='w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>Enroll</button>
  </form>
</template>
"@
    },
    @{
        Path = "frontend/src/components/enrollment/SectionSelector.vue"
        Content = @"
<template>
  <select class='w-full p-2 rounded bg-[#222] text-white'>
    <option>Section A</option>
    <option>Section B</option>
  </select>
</template>
"@
    }
)

foreach ($component in $components) {
    $fullPath = $component.Path
    $dir = Split-Path $fullPath -Parent
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $component.Content | Out-File -FilePath $fullPath -Encoding UTF8 -Force
    Write-Host "Created $fullPath" -ForegroundColor Green
}